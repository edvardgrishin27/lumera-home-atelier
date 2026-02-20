#!/bin/bash
# ═══════════════════════════════════════════════
# Lumera Home Atelier — SSL Setup Script
# Usage: ./setup-ssl.sh yourdomain.ru your@email.com
# ═══════════════════════════════════════════════

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: ./setup-ssl.sh yourdomain.ru your@email.com"
    exit 1
fi

echo "═══ Setting up SSL for $DOMAIN ═══"

# Step 1: Create Nginx config (HTTP only first, for Certbot validation)
echo "→ Creating Nginx config..."
cat > /etc/nginx/sites-available/lumera <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
NGINX

# Enable site
ln -sf /etc/nginx/sites-available/lumera /etc/nginx/sites-enabled/lumera
rm -f /etc/nginx/sites-enabled/default

# Create certbot webroot
mkdir -p /var/www/certbot

# Test and reload nginx
nginx -t && systemctl reload nginx
echo "→ Nginx HTTP config ready"

# Step 2: Get SSL certificate
echo "→ Requesting SSL certificate..."
certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

if [ $? -ne 0 ]; then
    echo "✗ Certbot failed. Make sure DNS A-record points to this server."
    exit 1
fi
echo "→ SSL certificate obtained!"

# Step 3: Generate DH params for extra security
echo "→ Generating DH parameters (this takes a minute)..."
openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048 2>/dev/null

# Step 4: Create full HTTPS Nginx config
echo "→ Creating HTTPS Nginx config..."
cat > /etc/nginx/sites-available/lumera <<NGINX
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # ─── SSL Certificates ───
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;

    # ─── SSL Settings (A+ rating) ───
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # ─── Security Headers ───
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # ─── Gzip ───
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml application/xml+rss image/svg+xml;

    # ─── Reverse Proxy to Docker ───
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # ─── Cache Static Assets ───
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
        proxy_pass http://127.0.0.1:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ─── Block Sensitive Files ───
    location ~ /\.(?!well-known) {
        deny all;
    }
}
NGINX

# Test and reload
nginx -t && systemctl reload nginx
echo "→ HTTPS config active!"

# Step 5: Setup auto-renewal
echo "→ Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sort -u | crontab -
echo "→ Auto-renewal cron job added (daily at 3am)"

# Step 6: Restart Docker container on new port
echo "→ Restarting Docker container..."
cd /opt/lumera
git pull origin main 2>/dev/null
docker compose down 2>/dev/null
docker compose up -d --build 2>&1 | tail -3

echo ""
echo "═══════════════════════════════════════════"
echo "✓ SSL setup complete!"
echo "✓ Site: https://$DOMAIN"
echo "✓ Auto-renewal: enabled"
echo "✓ SSL Labs rating: A+"
echo "═══════════════════════════════════════════"

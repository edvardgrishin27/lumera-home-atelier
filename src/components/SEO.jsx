import { useEffect } from 'react';

const SEO = ({ title, description }) => {
    useEffect(() => {
        // Set Title
        document.title = title ? `${title} | Lumera Home Atelier` : 'Lumera Home Atelier';

        // Set Description
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description);
        }
    }, [title, description]);

    return null;
};

export default SEO;

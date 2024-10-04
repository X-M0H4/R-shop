import { v2 as cloudinary } from 'cloudinary';

(async function() {
    // Configuration
    cloudinary.config({ 
        cloud_name: 'dqdusz5ci', 
        api_key: '668465652653965', 
        api_secret: 'LpF7D-Ct88blCFd6cctH5P2m-sY' // Remplacez par votre clé secrète
    });
    
    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(
          'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
              public_id: 'shoes',
              // Enlevez le timestamp ici, car il est géré automatiquement
          }
      )
      .catch((error) => {
          console.log(error);
      });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();

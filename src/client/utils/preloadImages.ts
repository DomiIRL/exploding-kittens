const cardImages = import.meta.glob('/public/assets/cards/**/*.{png,jpg}', { eager: true });

export const preloadCardImages = (): Promise<void[]> => {
  const imagesToPreload = Object.keys(cardImages).map(path =>
    path.replace('/public', '')
  );

  console.log(`Preloading ${imagesToPreload.length} card images...`);

  const promises = imagesToPreload.map((src) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        resolve();
      };
      img.src = src;
    });
  });

  return Promise.all(promises);
};


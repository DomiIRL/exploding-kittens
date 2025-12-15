// Remove the import.meta.glob entirely since it doesn't work with /public

export const preloadCardImages = (): Promise<void[]> => {
  // Define all card image paths manually based on your directory structure
  const cardTypes = [
    'attack', 'back', 'cat_card', 'defuse', 'exploding_kitten',
    'favor', 'nope', 'see_the_future', 'shuffle', 'skip'
  ];

  const imageCounts = {
    attack: 4,
    back: 1,
    cat_card: 5,
    defuse: 6,
    exploding_kitten: 4,
    favor: 4,
    nope: 5,
    see_the_future: 5,
    shuffle: 4,
    skip: 4
  };

  const imagesToPreload: string[] = [];

  // Build the list of image paths
  cardTypes.forEach(type => {
    const count = imageCounts[type as keyof typeof imageCounts];
    const extension = type === 'back' ? 'jpg' : 'png';

    for (let i = 0; i < count; i++) {
      imagesToPreload.push(`/assets/cards/${type}/${i}.${extension}`);
    }
  });

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

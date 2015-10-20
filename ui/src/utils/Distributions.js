// Helper for processing distribution files
export function separateTilesTypes(data, assets) {
  // Separate Tiles types from a list of tiles in 2 groups: suggested, directory
  var output = {raw: data, ui: {}};

  for (var locale in output.raw) {
    var tiles = data[locale];

    output.ui[locale] = {
      suggestedTiles: [],
      directoryTiles: []
    };

    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];

      // populate the imageURI and enhancedImageURI if tile is in compact format
      if (tile.hasOwnProperty('imageURI') && assets.hasOwnProperty(tile.imageURI)) {
        tile.imageURI = assets[tile.imageURI];
      }
      if (tile.hasOwnProperty('enhancedImageURI') && assets.hasOwnProperty(tile.enhancedImageURI)) {
        tile.enhancedImageURI = assets[tile.enhancedImageURI];
      }
      if (tile.frecent_sites) {
        output.ui[locale].suggestedTiles.push(tile);
      }
      else {
        output.ui[locale].directoryTiles.push(tile);
      }
    }
  }

  return output;
}

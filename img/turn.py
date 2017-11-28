import glob

from PIL import Image

image = Image.open('tiles.png')

turned = Image.new('RGBA', image.size)

for x in range(0, image.width, 32):
    for y in range(0, image.height, 32):
        tile = image.crop((x, y, x + 32, y + 32)).\
               transpose(Image.FLIP_LEFT_RIGHT).\
               transpose(Image.ROTATE_90)
        turned.paste(tile, (x, y, x + 32, y + 32))

turned.save('tiles_turned.png')

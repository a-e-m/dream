import glob

from PIL import Image

images = []
for file in glob.glob('*.png'):
	if file.startswith('Be'):
		img = Image.open(file)
		images.append(img)

width = max(x.width for x in images)
height = max(x.height for x in images)
sheet = Image.new('RGBA', (width * len(images), height))
print(width, height)
x = 0
for image in images:
	sheet.paste(image, (x, 0, x + image.width, image.height))
	x += width
sheet = sheet.resize((sheet.width // 5, sheet.height // 5), Image.LANCZOS)
sheet.save('bennett.png')

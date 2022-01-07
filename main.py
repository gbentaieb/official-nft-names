import os
import csv
import json

from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from datetime import datetime

output_path = './output'
images_dir_path = os.path.join(output_path, 'images')
json_dir_path = os.path.join(output_path, 'json')
minted_dir_path = os.path.join(output_path, 'mint_result')

names_edition = 4
minted_names_tracker = {}

def clear_output_directories():
    print(f'Clear output directories')

    def create_dir_if_not_exists(dir):
        if not os.path.exists(dir):
            os.makedirs(dir)

    def clear_dir(dir):
        for f in os.listdir(dir):
            os.remove(os.path.join(dir, f))

    for dir in [output_path, images_dir_path, json_dir_path, minted_dir_path]:
        create_dir_if_not_exists(dir)

        if dir != output_path:
            clear_dir(dir)

    print(f'Output directories cleared !')

def load_minted_names():
    with open('minted_names_tracker.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        row_count = 0

        for row in csv_reader:
            if row_count == 0:
                print(f'Loading already minted names...')
                row_count += 1
            elif len(row) > 0:
                name = row[0]
                minted_names_tracker[name] = True
                row_count += 1
            
        print(f'Loaded {row_count - 1} already minted names.')

def add_watermark(image_file, logo_file, logo_width, logo_height, opacity = 1):
    logo = Image.open(logo_file)

    logo = logo.resize((logo_width, logo_height), Image.ANTIALIAS)

    # position the watermark
    offset_x = (img.size[0] - logo.size[0]) - 10
    offset_y = 10

    watermark = Image.new('RGBA', image_file.size, (0, 0, 0, 0))
    watermark.paste(logo, (offset_x, offset_y), mask=logo.split()[3])

    alpha = watermark.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)

    watermark.putalpha(alpha)
    return Image.composite(watermark, image_file, watermark)

def get_text_size(text, font):
    def_image_width = 3500
    def_image_height = 700

    img = Image.new('RGBA', (def_image_width, def_image_height), color=(0, 0, 0, 0))
    canvas = ImageDraw.Draw(img)
    text_width, text_height = canvas.textsize(text, font=font)

    return [text_width, text_height]

def create_name_image(name, font, watermark_img, watermark_width, watermark_height):
    name_width, name_height = get_text_size(name, font)

    image_width = name_width + watermark_width + 20 + 15
    image_height = max(name_height, watermark_height) + 20
    
    name_img = Image.new('RGBA', (image_width, image_height), color=(0, 0, 0, 0))
    name_canvas = ImageDraw.Draw(name_img)

    text_x_pos = int((image_width - name_width - watermark_width) / 2)
    text_y_pos = int((image_height - name_height) / 2)

    name_canvas.text((text_x_pos, text_y_pos), name, font=font, fill='#383b3e')

    return name_img

if __name__ == "__main__":
    clear_output_directories()
    load_minted_names()

    with open('names.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        row_count = 0
        to_be_minted_name_count = 0

        for row in csv_reader:
            if row_count == 0:
                print(f'Start image generation. CSV Column names are {", ".join(row)}')
            else:
                name = row[0].strip().lower().capitalize()
                print(f'Name {row_count}: {name}')

                if not minted_names_tracker.get(name):
                    # create image
                    font = ImageFont.truetype('./resources/arial/Arial.ttf', size=156)
                    img = create_name_image(name, font, None, 60, 60)

                    wm_img = add_watermark(img, './resources/watermark.png', 60, 60, 1)
                    
                    if not os.path.exists(images_dir_path):
                        os.makedirs(images_dir_path)
                    
                    wm_img.save(images_dir_path + '/' + name + '.png', 'PNG')

                    # Create JSON
                    jsonData = {
                        "name": name,
                        "description": "Official Names NFT for: " + name,
                        "file_url": "ipfs://NewURIToReplace/" + name + ".png",
                        "custom_fields": {
                            "edition": names_edition
                        }
                    }

                    if not os.path.exists(json_dir_path):
                        os.makedirs(json_dir_path)

                    with open(json_dir_path + '/' + name + '.json', 'w') as jsonfile:
                        json.dump(jsonData, jsonfile)

                    to_be_minted_name_count += 1
                else:
                    print(f'Name {name} dropped: already minted.')

            row_count += 1

        print(f'Name to be minted: {to_be_minted_name_count} / {row_count - 1}')
        
    

"""One-off script: convert the white background of logo-mark.png to alpha
transparency using a luminance-to-alpha technique, so the mark can sit
directly on any background color."""

from PIL import Image

SRC = "public/logo-mark.png"
DST = "public/logo-mark.png"

img = Image.open(SRC).convert("RGB")
w, h = img.size
px = img.load()

# Sample the darkest pixel in the image to use as the flat ink color.
ink = (255, 255, 255)
darkest = 255 * 3
for y in range(0, h, 4):
    for x in range(0, w, 4):
        r, g, b = px[x, y]
        s = r + g + b
        if s < darkest:
            darkest = s
            ink = (r, g, b)

out = Image.new("RGBA", (w, h))
out_px = out.load()

for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        lum = (r + g + b) / 3
        alpha = max(0, min(255, int(255 - lum)))
        out_px[x, y] = (ink[0], ink[1], ink[2], alpha)

out.save(DST)
print("ink color:", ink)
print("saved", DST, out.size, out.mode)

import zipfile
import os

zf = zipfile.ZipFile("site.zip", "w")
for dirname, subdirs, files in os.walk("."):
    zf.write(dirname)
    for filename in files:
        zf.write(os.path.join(dirname, filename))
zf.close()
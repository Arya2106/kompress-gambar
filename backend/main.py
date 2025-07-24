from fastapi import FastAPI,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io 
import os

app = FastAPI()
from fastapi.staticfiles import StaticFiles

app.mount("/compressed", StaticFiles(directory="compressed"), name="compressed")

#ijinkan akses dari react (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint untuk menerima dan menyimpan file
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    # Kompres gambar
    max_size = (600, 400)
    image.thumbnail(max_size)

    # Buat folder jika belum ada
    os.makedirs("compressed", exist_ok=True)

    # Simpan ke folder compressed/ dengan nama yang sama
    save_path = os.path.join("compressed", file.filename)
    image.save(save_path, format="JPEG", quality=70, optimize=True)

    return {
        "message": "Gambar berhasil dikompres dan disimpan.",
        "filename": file.filename,
        "saved_path": save_path
    }

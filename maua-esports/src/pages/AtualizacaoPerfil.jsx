import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { HiUserCircle } from "react-icons/hi2";
import { FaPen } from "react-icons/fa";
import { MdDone } from "react-icons/md";
import { MdCancel } from "react-icons/md";

const AtualizacaoPerfil = () => {
  const [isPenHovered, setPenIsHovered] = useState(false);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [croppedImage, setCroppedImage] = useState(() => {
    return localStorage.getItem("croppedImage") || null;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };

  const createCircularImage = (src) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        // Tamanho do canvas igual ao diâmetro do círculo
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        
        // Criar máscara circular
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Desenhar a imagem centralizada
        ctx.drawImage(
          img,
          (img.width - size) / 2,
          (img.height - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size
        );
        
        resolve(canvas.toDataURL("image/jpeg"));
      };
      
      img.src = src;
    });
  };

  const handleCrop = async () => {
    if (image && croppedArea) {
      const canvas = document.createElement("canvas");
      const imageObj = new Image();
      imageObj.src = image;

      imageObj.onload = () => {
        canvas.width = croppedArea.width;
        canvas.height = croppedArea.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          imageObj,
          croppedArea.x,
          croppedArea.y,
          croppedArea.width,
          croppedArea.height,
          0,
          0,
          croppedArea.width,
          croppedArea.height
        );

        const croppedImageUrl = canvas.toDataURL("image/jpeg");
        
        // Aplicar o corte circular
        createCircularImage(croppedImageUrl).then((circularImageUrl) => {
          setCroppedImage(circularImageUrl);
          localStorage.setItem("croppedImage", circularImageUrl);
          setImage(null);
        });
      };
    }
  };

  return (

    <div>
      <div
        className="relative w-12 h-12 group"
        onMouseEnter={() => setPenIsHovered(true)}
        onMouseLeave={() => setPenIsHovered(false)}
        onClick={() => document.getElementById("file-input").click()}
      >
        <div className="w-full h-full rounded-full overflow-hidden">
          {croppedImage ? (
            <img
              src={croppedImage}
              alt="Foto de Perfil"
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300 cursor-pointer"
            />
          ) : (
            <HiUserCircle className="w-full h-full transform hover:scale-110 transition-transform duration-300 cursor-pointer hover:bg-hover hover:border-2 hover:border-borda hover:rounded-full" />
          )}
        </div>

        <div className="absolute bottom-0 right-0 rounded-full p-1 shadow-sm transition-opacity duration-300">
          <FaPen
            className="w-4 h-4 text-azul-claro"
            style={{
              animation: isPenHovered ? "shake 0.7s ease-in-out" : "none",
            }}
          />
        </div>
      </div>

      <input
        type="file"
        id="file-input"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {image && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white p-4 rounded-lg relative lg:mr-10"
            style={{ zIndex: 100 }}
          >
            <div
              className="relative"
              style={{ width: "300px", height: "300px", zIndex: 1 }}
            >
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1} // Mantém proporção 1:1 para garantir um círculo perfeito
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round" // Adiciona visualização de corte circular
              />
            </div>
            <div className="mt-4 flex justify-end" style={{ zIndex: 101 }}>
              <button
                onClick={handleCrop}
                className="w-8 h-8 flex items-center justify-center p-1 bg-emerald-300 rounded-full text-branco cursor-pointer hover:bg-green-600 hover:scale-110 transition-transform duration-300 mx-3"
              >
                <MdDone/>
              </button>
              <button
                onClick={() => setImage(null)}
                className="w-8 h-8 flex items-center justify-center p-1 bg-vermelho-claro rounded-full text-branco cursor-pointer hover:bg-red-500 hover:scale-110 transition-transform duration-300 mx-4"
              >
                <MdCancel/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtualizacaoPerfil;
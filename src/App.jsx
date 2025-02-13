import { useEffect, useState } from "react";
import { TextField, Button, Container, Paper, Typography, Box, IconButton } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import error_image from "./assets/error_image.png";
import { useRef } from "react";
import { generatePDF } from "./utils/generatePDF";


function App() {
  const [formData, setFormData] = useState({
    id_usuario: "",
    nombre: "",
    apellido: "",
    dni: "",
    fecha_emision: "",
    fecha_vencimiento: "",
    imageUrl: "", // Store image URL
    imageFile: null, // Store selected file
  });

  const [qrValue, setQrValue] = useState("");
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [download, setDownload] = useState(false);


  useEffect(() => {
    // When imageUrl changes, fetch the image
    if (formData.imageUrl) {
      fetchImage(formData.imageUrl);
    }
  }, [formData.imageUrl]); // This hook runs whenever imageUrl changes

  const handleChange = (e) => {
    setDownload(false);

    const { name, value } = e.target;

    switch (name) {
      case "id_usuario":
        if (!/^\d*$/.test(value)) return;
        break;

      case "nombre":
        break;

      case "apellido":
        break;

      case "dni":       
        break;

      case "fecha_emision": {
        const date = new Date(value);
        if (isNaN(date.getTime())) return;

        const nextYear = new Date(date);
        nextYear.setFullYear(date.getFullYear() + 1);

        setFormData((prev) => ({
          ...prev,
          fecha_emision: value,
          fecha_vencimiento: nextYear.toISOString().split("T")[0],
        }));
        return;
      }

      case "imageUrl":
        // Trigger image URL change in the state
        setFormData((prev) => ({ ...prev, imageUrl: value }));
        break;

      default:
        break;
    }

    // Update other form data fields
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchImage = async (imageUrl) => {
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }   

      if (!res.blob.size < 1000) {
        throw new Error(`Error fetching image`);
      }   
      
      
      const imageBlob = await res.blob();
      setFormData((prev) => ({
        ...prev,
        imageFile: URL.createObjectURL(imageBlob),
      }));
    } catch (error) {    
      setFormData((prev) => ({
        ...prev,
        imageFile: null,
      }));  
    let newErrors = {};
    newErrors.imageFile = "Error al cargar la imagen"
    setErrors(newErrors);

      console.log("Error fetching image:", error);
    }
  };
  // Handle image file selection
  const handleFileChange = (e) => {
    setDownload(false);
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageFile: reader.result }));
    };
    reader.readAsDataURL(file);
  };



  const generateQR = () => {
    console.log("Generating QR Code...");
    
    const dataString = `https://cursos29.infomatika.app/certificados/index.php?idp=${formData.id_usuario}`;
    setQrValue(dataString);
    return dataString;
  };
  
  const validateForm = () => {
    let newErrors = {};
  
    if (!formData.id_usuario) newErrors.id_usuario = "ID Usuario es requerido";
    if (!formData.nombre) newErrors.nombre = "Nombre es requerido";
    if (!formData.apellido) newErrors.apellido = "Apellido es requerido";
    if (!formData.dni) 
      {newErrors.dni = "DNI es requerido";}
    else{
      if (!/^\d{1,2}\.\d{3}\.\d{3}$/.test(formData.dni)) newErrors.dni = "Formato incorrecto. Debe ser xx.xxx.xxx";
    }
    if (!formData.fecha_emision) newErrors.fecha_emision = "Fecha de emisión es requerida";
    if (!formData.fecha_vencimiento) newErrors.fecha_vencimiento = "Fecha de vencimiento es requerida";
    if (!formData.imageFile) newErrors.imageFile = "Imagen es requerida";
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleGeneratePDF = async () => {
    if (validateForm()) {
      const newQRValue = await generateQR(formData.id_usuario);
      if (generatePDF(newQRValue, formData, download)) {
        setDownload(true);}
    }
  };

  const resetFields = async () => {
    let newFormData = 
    {
      id_usuario: "",
      nombre: "",
      apellido: "",
      dni: "",
      fecha_emision: "",
      fecha_vencimiento: "",
      imageUrl: "", // Store image URL
      imageFile: null, // Store selected file
    };
    let newErrors = {};
    
    setDownload(false);
    setFormData(newFormData);
    setErrors(newErrors);
    setQrValue('')
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          GENERAR PDF
        </Typography>

        <TextField
          fullWidth
          label="Id Usuario"
          name="id_usuario"
          value={formData.id_usuario}
          onChange={handleChange}
          margin="normal"
          error={!!errors.id_usuario}
          helperText={errors.id_usuario}
        />
        <TextField
          fullWidth
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          margin="normal"
          error={!!errors.nombre}
          helperText={errors.nombre}
        />
        <TextField
          fullWidth
          label="Apellido"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          margin="normal"
          error={!!errors.apellido}
          helperText={errors.apellido}
        />
        <TextField
          fullWidth
          label="DNI"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
          margin="normal"
          error={!!errors.dni}
          helperText={errors.dni}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            label="Fecha Emisión"
            name="fecha_emision"
            type="date"
            value={formData.fecha_emision}
            onChange={handleChange}
            margin="normal"
            error={!!errors.fecha_emision}
            helperText={errors.fecha_emision}
          />
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            label="Fecha Vencimiento"
            name="fecha_vencimiento"
            type="date"
            value={formData.fecha_vencimiento}
            onChange={handleChange}
            margin="normal"
            error={!!errors.fecha_vencimiento}
            helperText={errors.fecha_vencimiento}
          />
        </Box>


        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

          {/* Image URL */}
          <TextField
            fullWidth
            label="Imagen URL"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            margin="normal"
            error={!!errors.imageFile}
            helperText={errors.imageFile}
          />

          <IconButton onClick={() => fileInputRef.current.click()}>
            <FileUploadIcon />
          </IconButton>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }} // Hide the input
          />
        </Box>
        {(formData.imageFile || errors.imageFile) && (
          <Box mt={2} sx={{ display: "flex", alignItems: "flex-start", justifyContent:"space-evenly" ,flexDirection: "row" }}>
            <Box>
            <Typography variant="h6">Imagen</Typography>
            <img
              src={(errors.imageFile && !formData.imageFile) ? error_image : formData.imageFile}
              alt="Preview"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                height: 'auto',
                width: 'auto',
                marginTop: 10,
              }}
            />

            </Box>
            {qrValue && (
          <Box >
            <Typography variant="h6">QR Code</Typography>
            <Box id="qr-code" mt={1} display="flex" justifyContent="center">
              <QRCodeCanvas value={qrValue} size={150} />
            </Box>
          </Box>
        )}
          </Box>
        )}

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={resetFields}>
            RESETEAR
          </Button>
          {
            download ?
            <Button
            variant="contained"
            color="success"
            onClick={handleGeneratePDF}
          >
            Descargar PDF
          </Button>
            :
            <Button
            variant="contained"
            color="secondary"
            onClick={handleGeneratePDF}
          >
            Generar PDF
          </Button>
          }
         
        </Box>

        
      </Paper>
    </Container>
  );
}

export default App;

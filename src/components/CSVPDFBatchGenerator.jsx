import { useState } from "react";
import { Button, Typography, Box, Alert } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import error_image from "../assets/error_image.png";
import { useRef } from "react";
import Papa from 'papaparse';
import { generatePDFBatch } from "../utils/generatePDFBatch";
import QRCode from "qrcode";


const CSVPDFBatchGenerator = () => {
    const [csvData, setCsvData] = useState(null);
    const fileInputRef = useRef(null);
    const [download, setDownload] = useState(false);




    const handleFileUpload = (event) => {
        console.log("Uploading file...");

        const file = event.target.files[0];
        if (!file) return;

        setDownload(false); // Reset download state
        // Reset input to allow re-uploading the same file
        event.target.value = null;

        if (file.type === "text/csv") {
            Papa.parse(file, {
                complete: async (result) => {
                    // Process headers and convert them to lowercase
                    const data = await Promise.all(
                        result.data.map(async (row) => {
                            const lowercaseRow = {};

                            Object.keys(row).forEach((key) => {
                                const formattedKey = key.toLowerCase().replace(/\s+/g, "_"); // Lowercase & replace spaces
                                lowercaseRow[formattedKey] = row[key];
                            });

                            // Fetch image and add `imageFile` property if URL exists
                            try {
                                if (lowercaseRow.url_de_img) {
                                    lowercaseRow.imageFile = await fetchImage(lowercaseRow.url_de_img);
                                } else {
                                    lowercaseRow.imageFile = error_image;
                                }

                            } catch (error) {
                                console.log(error);

                                // If fetchImage fails (throws an error), use the fallback image
                                lowercaseRow.imageFile = error_image;
                            }

                            try {
                                if (lowercaseRow.id) {
                                    lowercaseRow.qrValue =`https://cursos29.infomatika.app/certificados/index.php?idp=${lowercaseRow.id}`
                                    lowercaseRow.qrImage = await generateQR(lowercaseRow.id);
                                }

                            } catch (error) {
                                console.log(error);
                            }

                            lowercaseRow.error = validateRow(lowercaseRow); // Validate the row
                            if (!lowercaseRow.error.fecha_1) {
                                const [day, month, year] = lowercaseRow.fecha_1.split('/');
                                const date = new Date(`${year}-${month}-${day}`); // Ensures correct parsing
                            
                                const nextYear = new Date(date);
                                nextYear.setFullYear(date.getUTCFullYear() + 1);
                            
                                // Formatting the date as DD/MM/YYYY
                                const dayStr = String(nextYear.getUTCDate()).padStart(2, '0');
                                const monthStr = String(nextYear.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
                                const yearStr = nextYear.getUTCFullYear();
                            
                                lowercaseRow.fecha_vencimiento = `${dayStr}/${monthStr}/${yearStr}`;
                            }
                            lowercaseRow.isValid = Object.keys(lowercaseRow.error).length === 0; // Check if the row is valid

                            return lowercaseRow;
                        })
                    );

                    console.log("Parsed CSV with Images:", data);
                    setCsvData(data); // Save processed data with images into state
                },
                header: true, // If your CSV has headers
                skipEmptyLines: true, // Skip empty lines
            });
        } else {
            alert("Please upload a valid CSV file");
        }
    };

    const generateQR = async (id) => {
        const url = `https://cursos29.infomatika.app/certificados/index.php?idp=${id}`;
        return await QRCode.toDataURL(url, {
            width: 125,
            margin: 0,
            errorCorrectionLevel: 'L',  // 'L' gives the smallest margin
          });
        };

    const fetchImage = async (imageUrl) => {
        try {

            const res = await fetch(imageUrl);
            if (!res.ok) {

                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const imageBlob = await res.blob();

            if (imageBlob.size < 1000) {

                throw new Error(`Error fetching image`);
            }

            return URL.createObjectURL(imageBlob); // Return the image URL instead of updating form state
        } catch (error) {

            console.log("Error fetching image:", error);
            return URL.createObjectURL(error_image); // Return the image URL instead of updating form state

        }
    };

    const validateRow = (row) => {
        let newErrors = {};

        if (!row.id) newErrors.id = "ID Usuario es requerido";
        if (!row.nombre) newErrors.nombre = "Nombre es requerido";
        if (!row.apellido) newErrors.apellido = "Apellido es requerido";
        if (!row.dni) { newErrors.dni = "DNI es requerido"; }
        else {
            if (!/^\d{7,8}$/.test(row.dni)) newErrors.dni = "Formato DNI incorrecto. Debe ser xxxxxxx (solo números)";
        }
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(row.fecha_1)) {
            newErrors.fecha_1 = "Formato fecha incorrecto. Debe ser DD/MM/AAAA";
        } else {
            // Verifica si la fecha es válida
            const [day, month, year] = row.fecha_1.split('/').map(num => parseInt(num, 10));
            const date = new Date(year, month - 1, day); // Mes en JavaScript empieza en 0
            if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                newErrors.fecha_1 = "Fecha no válida";
            }
        }
        if (!row.url_de_img) newErrors.url_de_img = "Imagen es requerida";

        return newErrors;
    };

    const handleGeneratePDF = async () => {
        if (generatePDFBatch(csvData, download)) {
            setDownload(true);
        }
    };



    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "space-between" }}>
                <Button sx={{ marginTop: '16px', marginBottom: '16px', marginLeft: '5px', marginRight: '5px' }} variant="contained" color="primary" startIcon={<FileUploadIcon />} onClick={() => fileInputRef.current.click()} >
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: "none" }} // Hide the input
                    />
                    SUBIR CSV
                </Button>
                {
                    download ?
                        <Button sx={{ marginTop: '16px', marginBottom: '16px', marginLeft: '5px', marginRight: '5px' }}
                            variant="contained"
                            color="success"
                            onClick={handleGeneratePDF}

                        >
                            Descargar PDF
                        </Button >
                        :
                        <Button sx={{ marginTop: '16px', marginBottom: '16px', marginLeft: '5px', marginRight: '5px' }}
                            variant="contained"
                            color="secondary"
                            disabled={csvData?.some(row => !row.isValid)}
                            onClick={handleGeneratePDF}

                        >
                            Generar PDF
                        </Button>
                }

            </Box>

            {csvData && [...csvData].sort((a, b) => a.isValid - b.isValid).map((alumno, index) => {

                return (


                    <Box key={index + alumno} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderColor: 'success.main', p: 2, mt: 2, padding: '10px',
                        margin: '5px',
                        marginBottom: '0.5rem',
                        borderRadius: '5px',
                        backgroundColor: alumno.isValid ? '#c8e6c9' : '#ffcdd2', // Green for valid, Red for invalid
                        border: alumno.isValid ? '1px solid #388e3c' : '1px solid #f44336', // Green border for valid, Red border for invalid
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "space-evenly", alignItems: "center" }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "space-evenly", alignItems: "center", gap: '0.85rem' }}>
                                <Box>
                                    <img
                                        src={alumno.imageFile}
                                        alt="Preview"
                                        style={{
                                            maxWidth: '125px',
                                            maxHeight: '125px',
                                            height: 'auto',
                                            width: 'auto',
                                        }}
                                    />

                                </Box>
                                {alumno.qrValue && (
                                    <Box >
                                        <Box id="qr-code" display="flex" justifyContent="center">
                                            <QRCodeCanvas value={alumno.qrValue} size={125} />
                                        </Box>
                                    </Box>
                                )}

                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: "space-evenly", alignItems: "flex-start", marginLeft: '20px' }}>
                                <Typography variant="h6">{alumno.id}</Typography>
                                <Typography variant="h6">{alumno.apellido + ", " + alumno.nombre}</Typography>
                                <Typography variant="h6">{alumno.dni}</Typography>
                                <Typography variant="h6">{alumno.fecha_1}</Typography>
                            </Box>
                        </Box>
                        <Box>
                            {alumno.error && Object.keys(alumno.error).map((key) => {
                                return (
                                    <Alert sx={{ marginTop: '.3rem' }} key={key} severity="error">{alumno.error[key]}.</Alert>
                                )
                            })}
                        </Box>

                    </Box>
                )
            })}

            <pre>{JSON.stringify(csvData, null, 2)}</pre>
        </Box>
    )
}

export { CSVPDFBatchGenerator };

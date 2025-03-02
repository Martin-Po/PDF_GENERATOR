/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Typography, Box, Alert, IconButton, TextField, Paper, Container } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import error_image from "../assets/error_image.png";
import { useRef } from "react";
import Papa from 'papaparse';
import { generatePDFBatch } from "../utils/generatePDFBatch";
import QRCode from "qrcode";
import DeleteIcon from '@mui/icons-material/Delete';
import Modal from '@mui/material/Modal';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from "dayjs";


const CSVPDFBatchGenerator = ({ csvData, setCsvData }) => {

    const fileInputRef = useRef(null);
    const [download, setDownload] = useState(false);



    const removeAlumno = (rowId) => {
        setCsvData((prevAlumnos) => prevAlumnos.filter(alumno => alumno.rowId !== rowId));
    };

    const updateAlumno = (rowId, updatedAlumno) => {
        setCsvData((prevAlumnos) =>
            prevAlumnos.map(alumno =>
                alumno.rowId === rowId ? { ...alumno, ...updatedAlumno } : alumno
            )
        );
    };

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

                            lowercaseRow.rowId = Math.random().toString(36).substr(2, 9); // Generate a random ID for each row

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
                                    lowercaseRow.qrValue = `https://cursos29.infomatika.app/certificados/index.php?idp=${lowercaseRow.id}`
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
        console.log("row", row);
        

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
        console.log("newErrors", newErrors);
        

        return newErrors;
    };

    const handleGeneratePDF = async () => {
        if (generatePDFBatch(csvData, download)) {
            // setDownload(true);
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
                            disabled={csvData?.some(row => !row.isValid) || !csvData}
                            onClick={handleGeneratePDF}

                        >
                            Generar PDF
                        </Button>
                }

            </Box>

            {csvData && [...csvData].sort((a, b) => a.isValid - b.isValid).map((alumno) => {

                return (

                    <PreviewCard alumno={alumno} key={alumno.rowId} removeAlumno={removeAlumno} updateAlumno={updateAlumno} validateRow={validateRow} />

                )
            })}

            <pre>{JSON.stringify(csvData, null, 2)}</pre>
        </Box>
    )
}

const PreviewCard = ({ alumno, removeAlumno, updateAlumno, validateRow }) => {

    const [hovered, setHovered] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (event) => {
        event.stopPropagation(); // Prevents bubbling up
        setOpen(false); // Close modal
    };

    const handleDeleteIconClick = (event) => {
        event.stopPropagation(); // Prevent the parent onClick from being triggered
        removeAlumno(alumno.rowId);
    };

    const handleEditIconClick = (event) => {
        event.stopPropagation(); // Prevent the parent onClick from being triggered
        handleOpen()
    };

    const errores = alumno.error ? Object.keys(alumno.error).length : 0;

    const ref = useRef(null);




    return (

        <Box sx={{

            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderColor: 'success.main', p: 2, mt: 2, padding: '10px',
            margin: '5px',
            marginBottom: '0.5rem',
            borderRadius: '5px',
            backgroundColor: alumno.isValid ? '#c8e6c9' : '#ffcdd2', // Green for valid, Red for invalid
            border: alumno.isValid ? '1px solid #388e3c' : '1px solid #f44336', // Green border for valid, Red border for invalid
            transition: 'height 0.6s ease',  // Smooth transition for height
            height: expanded ? `${150 + errores * 53}px` : `${65 + errores * 53}px`,
        }}
            onClick={() => setExpanded(!expanded)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <EditModal alumno={alumno} updateAlumno={updateAlumno} open={open} handleClose={handleClose} handleOpen={handleOpen} validateRow={validateRow} />

            <Box
                sx={{
                    position: 'absolute',  // Position this box absolutely in relation to its parent container
                    top: 0,
                    right: 0,
                    opacity: hovered ? 1 : 0,  // Show the box when hovered
                    transition: 'opacity 0.3s ease, visibility 0.3s ease',  // Smooth transition for visibility and opacity
                }}
                className="hover-box"
            >
                {/* Content of the box */}
                <IconButton
                    aria-label="delete"
                    onClick={handleEditIconClick}>
                    <EditIcon />
                </IconButton>
                <IconButton
                    aria-label="delete"
                    onClick={handleDeleteIconClick}  // Prevent the click from propagating to the parent
                >
                    <DeleteIcon />
                </IconButton>
            </Box>

            <Box
                ref={ref}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%',  // Ensure the outer box doesn't allow overflow
                    overflow: 'hidden',  // Prevent overflow
                }}
            >
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    gap: '0.85rem',
                    maxWidth: '100%',
                    transition: 'all 0.6s ease', // Ensure width and height transitions smoothly
                }}>

                    <Box>
                        <img
                            src={alumno.imageFile}
                            alt="Preview"
                            style={{
                                transition: 'all 0.6s ease',  // Smooth transition for image size
                                maxWidth: expanded ? '125px' : '50px',
                                maxHeight: expanded ? '125px' : '50px',
                                height: 'auto',
                                width: 'auto',
                            }}
                        />
                    </Box>

                    {alumno.qrValue && (
                        <Box
                            id="qr-code"
                            display="flex"
                            justifyContent="center"
                            sx={{
                                position: expanded ? 'relative' : 'absolute',  // Position the QR code absolutely when expanded
                                transform: expanded ? 'scale(1)' : 'scale(0.3)',
                                opacity: expanded ? 1 : 0,
                                visibility: expanded ? 'visible' : 'hidden',  // Keeps element in DOM but hides it
                                transition: 'transform 0.5s ease, opacity 0.3s ease',  // Smooth transition effect
                            }}
                        >
                            <QRCodeCanvas
                                value={alumno.qrValue}
                                size={125} // Keep a fixed size
                            />
                        </Box>
                    )}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginLeft: '20px',
                        overflow: 'hidden',  // Prevents overflow in the entire box
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: expanded ? 'column' : 'row', transition: 'flex-direction 0.3s ease', columnGap: '0.5rem', alignItems: 'flex-start' }}>
                        <Typography variant="h6" sx={{ fontSize: expanded ? '1.25rem' : '1.5rem' }} >{alumno.id}</Typography>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1.5rem', display: expanded ? 'none' : 'flex' }}> - </Typography>
                        <Typography
                            sx={{

                                textAlign: 'left',
                                whiteSpace: 'nowrap',      // Prevents text from wrapping
                                overflow: 'hidden',        // Hides the overflowed text
                                textOverflow: 'ellipsis',  // Adds ellipsis when text overflows
                                width: '100%',
                                fontSize: expanded ? '1.25rem' : '1.5rem'           // Makes Typography take full width of its container
                            }}
                            variant="h6"
                        >
                            {alumno.apellido + ", " + alumno.nombre}
                        </Typography>

                    </Box>
                    <Typography
                        sx={{
                            transition: 'opacity 0.3s ease, transform 1.5s ease',  // Smooth effect
                            pointerEvents: expanded ? 'auto' : 'none',  // Prevents interaction when hidden
                            position: expanded ? 'relative' : 'absolute',  // Position the QR code absolutely when expanded
                            opacity: expanded ? 1 : 0,  // Hides when not expanded
                        }}
                        variant="h6"
                    >
                        {alumno.dni}
                    </Typography>
                    <Typography sx={{
                        transition: 'opacity 0.3s ease, transform 1.5s ease',  // Smooth effect
                        pointerEvents: expanded ? 'auto' : 'none',  // Prevents interaction when hidden
                        position: expanded ? 'relative' : 'absolute',  // Position the QR code absolutely when expanded
                        opacity: expanded ? 1 : 0,  // Hides when not expanded
                    }} variant="h6">{alumno.fecha_1}</Typography>
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
}

const EditModal = ({ alumno, updateAlumno, open, handleClose, validateRow }) => {

    const [errors, setErrors] = useState({});

    let auxFechaEmision = ""
    let auxFechaVencimiento = ""



    if (alumno.fecha_1?.split('/').length === 3) {
        let [day, month, year] = alumno.fecha_1.split('/');
        auxFechaEmision = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        if (alumno.fecha_vencimiento?.split('/').length === 3) {

            [day, month, year] = alumno.fecha_vencimiento.split('/');
            auxFechaVencimiento = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

    }


    const [updatedAlumno, setUpdatedAlumno] = useState({
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        dni: alumno.dni,
        auxFechaEmision: auxFechaEmision,
        auxFechaVencimiento: auxFechaVencimiento,
        fecha_1: alumno.fecha_1,
        fecha_vencimiento: alumno.fecha_vencimiento,
        imageUrl: alumno.url_de_img, // Store image URL
        imageFile: alumno.imageFile, // Store selected file
    });




    const handleUpdateFormChange = (e) => {

        const { name, value } = e.target;
        let updatedErrors = {}
        console.log("name", name);
        

        if (name === "fecha_emision") {
            console.log("If fecha_emision");
            
            
            let [year, month, day] = value.split("-")
            const updatedFechaEmision = `${day}/${month}/${year}`
            console.log("Fecha enviada " + `${day}/${month}/${year}`);
            
            
            updatedErrors.error = validateRow({ ...alumno, fecha_1: updatedFechaEmision });
        }
        else if (name === "fecha_vencimiento") {
            console.log("If fecha_vencimiento");
            
            let [year, month, day] = value.split("-")
            const updatedFechaVencimiento = `${day}/${month}/${year}`
            updatedErrors.error = validateRow({ ...alumno,fecha_vencimiento: updatedFechaVencimiento });
        }
        else {
            console.log("Else");
            
            updatedErrors.error = validateRow({ ...alumno, [name]: value });
        }
                
        updatedErrors.isValid = Object.keys(updatedErrors.error).length === 0; // Check if the row is valid        
        
        switch (name) {
            case "id":
                if (!/^\d*$/.test(value)) return;
                break;

            case "nombre":
                break;

            case "apellido":
                break;

            case "dni":
                break;

            case "fecha_emision": {
                console.log("value", value);
                
                const date = new Date(value);
                if (isNaN(date.getTime())) return;

                let [year, month, day] = value.split("-")
                const updatedFechaEmision = `${day}/${month}/${year}`

                const nextYear = new Date(date);
                nextYear.toISOString().split("T")[0]
                nextYear.setFullYear(date.getFullYear() + 1);
                let [year_2, month_2, day_2] = nextYear.toISOString().split("T")[0].split("-")
                const updatedFechaVencimiento = `${day_2}/${month_2}/${year_2}`
                console.log("updatedFechaEmision", updatedFechaEmision);

                console.log("auxFechaEmision"+ value + 
                    " fecha_1" + updatedFechaEmision +
                    " fecha_vencimiento " + updatedFechaVencimiento,
                    " auxFechaVencimiento " +  nextYear.toISOString().split("T")[0].split("-"),
                    " error " + updatedErrors.error,
                    " isValid " +  updatedErrors.isValid);
                
                    console.log("Antes de setear", updatedErrors.error);
                

                setUpdatedAlumno((prev) => ({
                    ...prev,
                    auxFechaEmision: value,
                    fecha_1: updatedFechaEmision,
                    fecha_vencimiento: updatedFechaVencimiento,
                    auxFechaVencimiento: nextYear.toISOString().split("T")[0],
                    error: updatedErrors.error,
                    isValid: updatedErrors.isValid
                }));
                return;
            }

            case "fecha_vencimiento": {
                const date = new Date(value);
                if (isNaN(date.getTime())) return;

                let [year, month, day] = value.split("-")
                const updatedFechaVencimiento = `${day}/${month}/${year}`


                
                setUpdatedAlumno((prev) => ({
                    ...prev,
                    fecha_vencimiento: updatedFechaVencimiento,
                    auxFechaVencimiento: value,
                    error: updatedErrors.error,
                    isValid: updatedErrors.isValid
                }));
                return;
            }

            case "imageUrl":
                // Trigger image URL change in the state
                setUpdatedAlumno((prev) => ({ ...prev, imageUrl: value }));
                break;

            default:
                break;
        }

        

        setUpdatedAlumno((prev) => ({
            ...prev,
            [name]: value,
            error: updatedErrors.error,
            isValid: updatedErrors.isValid
        }));

      
    };

    const handleUpdateAlumno = () => {
        updateAlumno(alumno.rowId, updatedAlumno);
        handleClose;
    }



    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Container maxWidth="sm">
                <Paper onClick={(e) => e.stopPropagation()} elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>

                    <TextField
                        fullWidth
                        label="id"
                        name="id"
                        value={updatedAlumno.id}
                        onChange={handleUpdateFormChange}
                        margin="normal"
                        error={!!errors.id_usuario}
                        helperText={errors.id_usuario}
                    />
                    <TextField
                        fullWidth
                        label="Nombre"
                        name="nombre"
                        value={updatedAlumno.nombre}
                        onChange={handleUpdateFormChange}
                        margin="normal"
                        error={!!errors.nombre}
                        helperText={errors.nombre}
                    />
                    <TextField
                        fullWidth
                        label="Apellido"
                        name="apellido"
                        value={updatedAlumno.apellido}
                        onChange={handleUpdateFormChange}
                        margin="normal"
                        error={!!errors.apellido}
                        helperText={errors.apellido}
                    />
                    <TextField
                        fullWidth
                        label="DNI"
                        name="dni"
                        value={updatedAlumno.dni}
                        onChange={handleUpdateFormChange}
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
                            value={updatedAlumno.auxFechaEmision}
                            onChange={handleUpdateFormChange}
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
                            value={updatedAlumno.auxFechaVencimiento}
                            onChange={handleUpdateFormChange}
                            margin="normal"
                            error={!!errors.fecha_vencimiento}
                            helperText={errors.fecha_vencimiento}
                        />
                    </Box>




                    <Box mt={2} display="flex" justifyContent="space-between">
                        <Button variant="contained" color="primary" onClick={handleClose}>
                            CANCELAR
                        </Button>
                        {
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleUpdateAlumno}
                            >
                                ACEPTAR
                            </Button>

                        }

                    </Box>
                </Paper>
            </Container>

        </Modal>
    )

}


export { CSVPDFBatchGenerator };

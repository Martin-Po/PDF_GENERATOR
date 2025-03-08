/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Typography, Box, Alert, IconButton, TextField, Paper, Container, CircularProgress, Grid2 } from "@mui/material";
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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { generatePDF } from "../utils/generatePDF";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PersonIcon from '@mui/icons-material/Person';
import firmaPNG from "../assets/firma.png";
import cursos29_logo from "../assets/cursos29_logo.png";



const CSVPDFBatchGenerator = ({ csvData, setCsvData }) => {

    const fileInputRef = useRef(null);
    const [download, setDownload] = useState(false);
    const [loading, setLoading] = useState(false);


    // useEffect(() => {
    //     // Check if all alumnos have download set to true
    //     const allDownloaded = csvData.every(alumno => alumno.download === true);

    //     if (allDownloaded) {
    //         setDownload(true);
    //     }
    // }, [csvData]); 



    const removeAlumno = (rowId) => {
        setDownload(false); // Reset download state
        setCsvData((prevAlumnos) => prevAlumnos.filter(alumno => alumno.rowId !== rowId));
    };

    const updateAlumno = (rowId, updatedAlumno) => {
        setDownload(false); // Reset download state
        setCsvData((prevAlumnos) =>
            prevAlumnos.map(alumno =>
                alumno.rowId === rowId ? { ...alumno, ...updatedAlumno, download: false } : alumno
            )
        );
    };

    const handleFileUpload = (event) => {
        console.log("Uploading file...");
        setLoading(true);
        setCsvData(null); // Reset CSV data


        try {
            const file = event.target.files[0];
            if (!file) return;

            setDownload(false); // Reset download state
            // Reset input to allow re-uploading the same file
            event.target.value = null;

            if (file.type === "text/csv") {
                Papa.parse(file, {
                    complete: async (result) => {
                        try {
                            // Process headers and convert them to lowercase
                            const data = await Promise.all(
                                result.data.map(async (row) => {
                                    const lowercaseRow = {};

                                    Object.keys(row).forEach((key) => {
                                        let formattedKey = key.toLowerCase().replace(/\s+/g, "_")
                                        if (key.toLowerCase().replace(/\s+/g, "_") === "fecha_1") {
                                            formattedKey = "fecha_emision"
                                        }
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
                                    if (!lowercaseRow.error.fecha_emision) {
                                        const [day, month, year] = lowercaseRow.fecha_emision.split('/');
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

                                    lowercaseRow.download = false

                                    return lowercaseRow;
                                })
                            );
                            setCsvData(data); // Save processed data with images into state

                        } catch (error) {
                            console.error("Error parsing CSV:", error);
                        }
                        finally {
                            setLoading(false);
                        }
                    },
                    header: true, // If your CSV has headers
                    skipEmptyLines: true, // Skip empty lines
                });
            } else {
                alert("Please upload a valid CSV file");
            }
        }
        catch (error) {
            console.error("Error uploading file:", error);
            setLoading(false);
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
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(row.fecha_emision)) {
            newErrors.fecha_emision = "Formato fecha incorrecto. Debe ser DD/MM/AAAA";
        } else {
            // Verifica si la fecha es válida
            const [day, month, year] = row.fecha_emision.split('/').map(num => parseInt(num, 10));
            const date = new Date(year, month - 1, day); // Mes en JavaScript empieza en 0
            if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                newErrors.fecha_emision = "Fecha no válida";
            }
        }
        if (row.imageFile === error_image) newErrors.url_de_img = "Error al cargar la imagen";
        if (!row.url_de_img) newErrors.url_de_img = "Imagen es requerida";

        return newErrors;
    };

    const handleGeneratePDF = async () => {
        if (generatePDFBatch(csvData, download)) {
            setDownload(true);
            setCsvData((prevAlumnos) =>
                prevAlumnos.map(alumno => ({
                    ...alumno,
                    download: true // Assuming you want to set it to true
                }))
            );
        }
    };

    const handleGenerateSinglePDF = async (credencial, download) => {
        generatePDF(credencial, download)
        setCsvData((prevAlumnos) =>
            prevAlumnos.map(alumno =>
                alumno.rowId === credencial.rowId ? { ...alumno, download: true } : alumno
            )
        );
    }


    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "space-between" }}>
                <Box sx={{ position: 'relative' }}>
                    <Button disabled={loading} sx={{ marginTop: '16px', marginBottom: '16px', marginLeft: '5px', marginRight: '5px' }} variant="contained" color="primary" startIcon={<FileUploadIcon />} onClick={() => fileInputRef.current.click()} >
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: "none" }} // Hide the input
                        />
                        SUBIR CSV
                    </Button>
                    {loading && <CircularProgress
                        size={24}
                        sx={{
                            color: "green",
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />}

                </Box>
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

            {csvData && [...csvData].sort((a, b) => a.isValid - b.isValid).map((alumno, index) => {

                return (
                    <Grid2 key={alumno.rowId} container sx={{ width: '100%', alignItems: 'center' }} spacing={0}>
                        <Grid2 xs={1} sx={{ width: '5%' }}>
                            <Box>{index + 1}</Box>
                        </Grid2>

                        <Grid2 xs={10} sx={{ width: '90%' }}>
                            <PreviewCard
                                alumno={alumno}
                                key={alumno.rowId}
                                removeAlumno={removeAlumno}
                                updateAlumno={updateAlumno}
                                validateRow={validateRow}
                                generateQR={generateQR}
                            />
                        </Grid2>

                        <Grid2 xs={1} sx={{ width: '5%' }}>
                            <IconButton sx={{ padding: '4px' }} onClick={() => handleGenerateSinglePDF(alumno, false)} >
                                <PictureAsPdfIcon />
                            </IconButton>
                            <IconButton sx={{ padding: '4px' }} onClick={() => handleGenerateSinglePDF(alumno, true)} disabled={!alumno.download} >
                                <FileDownloadIcon />
                            </IconButton>
                        </Grid2>
                    </Grid2>


                )
            })}

        </Box>
    )
}

const PreviewCard = ({ alumno, removeAlumno, updateAlumno, validateRow, generateQR }) => {

    const [hovered, setHovered] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (event) => {
        event.stopPropagation(); // Prevents bubbling up
        setOpen(false); // Close modal
        setHovered(false);

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
            width: 'fill-available',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderColor: 'success.main', p: 2, mt: 2, padding: '10px', paddingTop:'7px', paddingBottom: expanded ? '5px' : '10px', justifyContent:'center',
            margin: '5px',
            borderRadius: '5px',
            backgroundColor: expanded ? 'white' : alumno.isValid ? '#c8e6c9' : '#ffcdd2', // Green for valid, Red for invalid
            border: alumno.isValid ? '1px solid #388e3c' : '1px solid #f44336', // Green border for valid, Red border for invalid
            transition: 'height 0.6s ease',  // Smooth transition for height
            height: expanded ? `${280 + errores * 53}px` : `${65 + errores * 53}px`,
        }}
            onClick={() => setExpanded(!expanded)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <EditModal alumno={alumno} updateAlumno={updateAlumno} open={open} handleClose={handleClose} handleOpen={handleOpen} validateRow={validateRow} setOpen={setOpen} generateQR={generateQR} setHovered={setHovered}></EditModal>

            <Box
                sx={{
                    position: 'absolute',  // Position this box absolutely in relation to its parent container
                    top: 0,
                    right: 0,
                    opacity: hovered ? 1 : 0,  // Show the box when hovered
                    backgroundColor: expanded ? '#d3d3d3' : 'none',
                    borderRadius: '15px',
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
                sx={{
                    position: 'absolute',  // Position this box absolutely in relation to its parent container
                    bottom: 40,
                    right: 20,
                    borderRadius: '15px',
                    opacity: expanded ? 1 : 0,
                    visibility: expanded ? 'visible' : 'hidden',  // Keeps element in DOM but hides it
                    transition: 'transform 0.5s ease, opacity 0.3s ease',  // Smooth transition effect
               
                }}
            >
                <img
                    src={firmaPNG}
                    alt="Preview"
                    style={{
                        
                        transition: 'all 0.6s ease',  // Smooth transition for image size
                        maxWidth: expanded ? '100px' : '30px',
                        maxHeight: expanded ? '100px' : '30px',
                        height: expanded ? '80px' : 'auto',
                        width: expanded ? '80px' : 'auto',
                    }}
                />

            </Box>
            <Box
                sx={{
                    position: 'absolute',  // Position this box absolutely in relation to its parent container
                    top: 80,
                    right: 45,
                    borderRadius: '15px',
                    opacity: expanded ? 1 : 0,
                    visibility: expanded ? 'visible' : 'hidden',  // Keeps element in DOM but hides it
                    transition: 'transform 0.5s ease, opacity 0.3s ease',  // Smooth transition effect
               
                }}
            >
                <img
                    src={cursos29_logo}
                    alt="Preview"
                    style={{
                        
                        transition: 'all 0.6s ease',  // Smooth transition for image size
                        maxWidth: expanded ? '100px' : '50px',
                        maxHeight: expanded ? '100px' : '50px',
                        height: expanded ? '100px' : 'auto',
                        width: expanded ? '100px' : 'auto',
                    }}
                />

            </Box>
            <Box>
                <Box
                    ref={ref}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: expanded ? 'flex-start' : 'center',
                        width: '100%',  // Ensure the outer box doesn't allow overflow
                        overflow: 'hidden',  // Prevent overflow
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        backgroundColor: expanded ? 'RGB(237, 28, 36)' : 'none',
                        flexDirection: 'column',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        maxWidth: '100%',
                        transition: 'all 0.6s ease', // Ensure width and height transitions smoothly
                    }}>

                        <Box>
                            <img
                                src={alumno.imageFile}
                                alt="Preview"
                                style={{
                                    transition: 'all 0.6s ease',  // Smooth transition for image size
                                    maxWidth: expanded ? '100px' : '50px',
                                    maxHeight: expanded ? '100px' : '50px',
                                    height: expanded ? '100px' : 'auto',
                                    width: expanded ? '100px' : 'auto',
                                }}
                            />
                        </Box>

                        {alumno.qrValue && (
                            <Box
                                id="qr-code"
                                display="flex"
                                justifyContent="center"
                                sx={{
                                    marginBottom:'0.3rem', marginTop:'0.85rem',
                                    position: expanded ? 'relative' : 'absolute',  // Position the QR code absolutely when expanded
                                    transform: expanded ? 'scale(1)' : 'scale(0.3)',
                                    opacity: expanded ? 1 : 0,
                                    visibility: expanded ? 'visible' : 'hidden',  // Keeps element in DOM but hides it
                                    transition: 'transform 0.5s ease, opacity 0.3s ease',  // Smooth transition effect
                                }}
                            >
                                <Box sx={{ backgroundColor: 'white', padding: '0.5rem', paddingBottom: '0.15' }}>
                                    <QRCodeCanvas
                                        value={alumno.qrValue}
                                        size={70} // Keep a fixed size
                                    />
                                </Box>
                            </Box>
                        )}
                        <Typography sx={{ marginBottom:'0.55rem', lineHeight: '2', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', display: expanded ? "block" : "none" }}>
                            ESCANEAR QR</Typography>
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
                        <Typography sx={{ display: expanded ? 'block' : 'none', backgroundColor: 'black', color: 'white', fontSize: '0.75rem', padding: '0.2rem', paddingLeft: '.5rem', paddingRight: '0.5rem' }}>
                            AUTORIZACION MANEJO SEGURO AUTOELEVADOR</Typography>
                        <Box sx={{ display: 'flex', flexDirection: expanded ? 'column' : 'row', transition: 'flex-direction 0.3s ease', columnGap: '0.5rem', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                            <Typography variant="h6" sx={{ fontSize: '1.5rem', display: expanded ? 'none' : 'block' }} >{alumno.id}</Typography>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '1.5rem', display: expanded ? 'none' : 'flex' }}> - </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ display: expanded ? 'block' : 'none' }} />
                                <Typography
                                    sx={{

                                        textAlign: 'left',
                                        whiteSpace: 'nowrap',      // Prevents text from wrapping
                                        overflow: 'hidden',        // Hides the overflowed text
                                        textOverflow: 'ellipsis',  // Adds ellipsis when text overflows
                                        width: '100%',
                                        fontSize: expanded ? '1.25rem' : '1.5rem',           // Makes Typography take full width of its container
                                        fontWeight: expanded ? 'bold' : 'normal',
                                        color: expanded ? 'RGB(237, 28, 36)' : 'black',
                                    }}
                                    variant="h6"
                                >
                                    {alumno.apellido + ", " + alumno.nombre}
                                </Typography>
                            </Box>

                        </Box>
                        <Box sx={{ display: expanded ? 'flex' : 'none', flexDirection: 'column', alignItems: 'flex-start', marginTop: '0.5rem' }}>

                            <Typography
                                sx={{
                                    transition: 'opacity 0.3s ease, transform 1.5s ease',  // Smooth effect
                                    pointerEvents: expanded ? 'auto' : 'none',  // Prevents interaction when hidden
                                    position: expanded ? 'relative' : 'absolute',  // Position the QR code absolutely when expanded
                                    fontSize: '1rem'
                                }}
                                variant="h6"
                            >
                                DNI: {alumno.dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            </Typography>
                            <Typography sx={{
                                transition: 'opacity 0.3s ease, transform 1.5s ease',  // Smooth effect
                                pointerEvents: expanded ? 'auto' : 'none',  // Prevents interaction when hidden
                                fontSize: '1rem'
                            }} variant="h6">
                                FECHA: {alumno.fecha_emision}</Typography>
                            <Typography sx={{
                                transition: 'opacity 0.3s ease, transform 1.5s ease',  // Smooth effect
                                pointerEvents: expanded ? 'auto' : 'none',  // Prevents interaction when hidden
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                color: expanded ? 'RGB(237, 28, 36)' : 'black'

                            }} variant="h6">
                                VENCE: {alumno.fecha_vencimiento}</Typography>
                            <Typography sx={{
                                marginTop: '0.4rem',
                                transition: 'opacity 0.3s ease, transform 1.5s ease',  // Smooth effect
                                pointerEvents: expanded ? 'auto' : 'none',  // Prevents interaction when hidden
                                fontSize: '0.75rem'
                            }} variant="h6">
                                Alcance: Vehículos hasta 3500 kg.</Typography>
                            <Typography sx={{
                                marginTop: '0.4rem',
                                transition: 'opacity 0.3s ease, transform 1.5s ease',  // Smooth effect
                                pointerEvents: expanded ? 'auto' : 'none',  // Prevents interaction when hidden
                                fontSize: '0.85rem',
                                fontWeight: 'bold'

                            }} variant="h6">
                                Instructor: Lic. Alan Guerrero</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ backgroundColor: 'black', display: expanded ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', transition: 'all 2s ease', height: '1.5rem' }}>
                <Typography sx={{ color: 'white', fontSize: '0.65rem', }}> En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T.</Typography>
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

const EditModal = ({ alumno, updateAlumno, open, handleClose, validateRow, setOpen, generateQR, setHovered }) => {


    let auxFechaEmision = ""
    let auxFechaVencimiento = ""

    if (alumno.fecha_emision?.split('/').length === 3) {
        let [day, month, year] = alumno.fecha_emision.split('/');
        auxFechaEmision = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        if (alumno.fecha_vencimiento?.split('/').length === 3) {

            [day, month, year] = alumno.fecha_vencimiento.split('/');
            auxFechaVencimiento = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }

    const [changed, setChanged] = useState(false);

    const [updatedAlumno, setUpdatedAlumno] = useState({
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        dni: alumno.dni,
        auxFechaEmision: auxFechaEmision,
        auxFechaVencimiento: auxFechaVencimiento,
        fecha_emision: alumno.fecha_emision,
        fecha_vencimiento: alumno.fecha_vencimiento,
        imageUrl: alumno.url_de_img, // Store image URL
        imageFile: alumno.imageFile, // Store selected file
    });


    useEffect(() => {
        setUpdatedAlumno({
            id: alumno.id,
            nombre: alumno.nombre,
            apellido: alumno.apellido,
            dni: alumno.dni,
            auxFechaEmision: auxFechaEmision,
            auxFechaVencimiento: auxFechaVencimiento,
            fecha_emision: alumno.fecha_emision,
            fecha_vencimiento: alumno.fecha_vencimiento,
            imageUrl: alumno.url_de_img, // Store image URL
            imageFile: alumno.imageFile, // Store selected file
        });
        setChanged(false);
    }, [open]);  // Dependency array: Runs when `open` changes


    const handleUpdateFormChange = async (e) => {

        const { name, value } = e.target;
        let updatedErrors = {}

        setChanged(true);


        if (name === "fecha_emision") {

            let [year, month, day] = value.split("-")
            const updatedFechaEmision = `${day}/${month}/${year}`
            updatedErrors.error = validateRow({ ...alumno, fecha_emision: updatedFechaEmision });
        }
        else if (name === "fecha_vencimiento") {
            let [year, month, day] = value.split("-")
            const updatedFechaVencimiento = `${day}/${month}/${year}`
            updatedErrors.error = validateRow({ ...alumno, fecha_vencimiento: updatedFechaVencimiento });
        }
        else {
            updatedErrors.error = validateRow({ ...alumno, [name]: value });
        }

        updatedErrors.isValid = Object.keys(updatedErrors.error).length === 0; // Check if the row is valid        

        switch (name) {
            case "id":
                {
                    if (!/^\d*$/.test(value)) return;
                    const qrValue = `https://cursos29.infomatika.app/certificados/index.php?idp=${value}`
                    const qrImage = await generateQR(value);
                    setUpdatedAlumno((prev) => ({
                        ...prev,
                        id: value,
                        qrValue: qrValue,
                        qrImage: qrImage,
                        error: updatedErrors.error,
                        isValid: updatedErrors.isValid
                    }));
                    return;
                }

            case "nombre":
                break;

            case "apellido":
                break;

            case "dni":
                break;

            case "fecha_emision": {
                const date = new Date(value);
                if (isNaN(date.getTime())) return;

                let [year, month, day] = value.split("-")
                const updatedFechaEmision = `${day}/${month}/${year}`

                const nextYear = new Date(date);
                nextYear.toISOString().split("T")[0]
                nextYear.setFullYear(date.getFullYear() + 1);
                let [year_2, month_2, day_2] = nextYear.toISOString().split("T")[0].split("-")
                const updatedFechaVencimiento = `${day_2}/${month_2}/${year_2}`

                setUpdatedAlumno((prev) => ({
                    ...prev,
                    auxFechaEmision: value,
                    fecha_emision: updatedFechaEmision,
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
        setOpen(false);
        setHovered(false);

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
                    />
                    <TextField
                        fullWidth
                        label="Nombre"
                        name="nombre"
                        value={updatedAlumno.nombre}
                        onChange={handleUpdateFormChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Apellido"
                        name="apellido"
                        value={updatedAlumno.apellido}
                        onChange={handleUpdateFormChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="DNI"
                        name="dni"
                        value={updatedAlumno.dni}
                        onChange={handleUpdateFormChange}
                        margin="normal"
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
                        />
                    </Box>




                    <Box mt={2} display="flex" justifyContent="space-between">
                        <Button variant="contained" color="primary" onClick={handleClose}>
                            CANCELAR
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            disabled={!changed}
                            onClick={handleUpdateAlumno}
                        >
                            ACEPTAR
                        </Button>

                    </Box>
                </Paper>
            </Container>

        </Modal>
    )

}


export { CSVPDFBatchGenerator };

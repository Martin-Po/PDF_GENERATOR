import { jsPDF } from "jspdf";
import cursos29_logo from "../assets/cursos29_logo.png";
import firmaPNG from "../assets/firma.png";
import person_icon from "../assets/person_icon.png";
import { montserratFont } from "../assets/fonts/Montserrat-Regular-normal";
import { ibmplexFont } from "../assets/fonts/IBMPlexSans-Regular-normal";
import { ibmplexBoldFont } from "../assets/fonts/IBMPlexSans-Bold-bold";
import { montserratBoldFont } from "../assets/fonts/Montserrat-Bold-bold";



export const generatePDFBatch = (csvData, download) => {
    console.log("csvData:", csvData);

    const pdf = new jsPDF("portrait", "cm", "a4");

    pdf.addFileToVFS("IBMPlexSans-Regular.ttf", ibmplexFont);
    pdf.addFont("IBMPlexSans-Regular.ttf", "IBMPlex", "normal");

    pdf.addFileToVFS("IBMPlexSans-Bold.ttf", ibmplexBoldFont);
    pdf.addFont("IBMPlexSans-Bold.ttf", "IBMPlex", "bold");

    pdf.addFileToVFS("Montserrat-Regular.ttf", montserratFont);
    pdf.addFont("Montserrat-Regular.ttf", "Montserrat", "normal");

    pdf.addFileToVFS("Montserrat-Bold.ttf", montserratBoldFont);
    pdf.addFont("Montserrat-Bold.ttf", "Montserrat", "bold");


    const formatDate = (date) => {
        const formatedDate = new Date(date); // Ensure it's a Date object
        const day = String(formatedDate.getUTCDate()).padStart(2, "0");
        const month = String(formatedDate.getUTCMonth() + 1).padStart(2, "0");
        const year = formatedDate.getUTCFullYear();
        return (`${day}/${month}/${year}`);
    }



    csvData.map((alumno, index) => {
        const cardHeight = 5.4;
        const cardWidth = 8.26;
        const position = { x: 2.08 + (index === 1 ? 1 : index%2)*cardWidth, y: 4.185 + cardHeight*Math.floor(index/2) };
        console.log("position:", position);
        console.log("x:", (index === 1 ? 1 : index%2));
        console.log("y:", Math.floor(index/2));
        
        
        console.log("index:", index);
        
        

        pdf.setLineWidth(0.035); // Makes the border thinner


        // Add Image (either from URL or File)
        pdf.addImage(alumno.imageFile, "JPEG", 2.43, 4.485, 2, 2);//Carnet photo


        //First credential square

        //Bottom black rectangle
        pdf.setFillColor(35, 31, 32); // Same color as the original shape
        pdf.roundedRect(2.08, 8.75, 8.26, 0.85, 0.15, 0.15, "F"); // Draw the rectangle
        pdf.setFillColor("white"); // Same color as the original shape
        pdf.rect(2.08, 8.31, 8.26, 0.55, "F"); // Covers only the top part

        pdf.setTextColor("white");
        pdf.setFontSize(6.5);
        let auxtextWidth = pdf.getTextWidth("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T")
        let auxtextHeight = pdf.getTextDimensions("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T").h;
        auxtextHeight = auxtextHeight * 0.75;// Substracting 25% of the height representing the top margin
        pdf.text("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T", 2.08 + 8.28 / 2 - auxtextWidth / 2, 8.86 + auxtextHeight / 2 + 0.72 / 2);
        //Bottom black rectangle

        //QR section
        pdf.setFillColor(237, 28, 36); // Red
        pdf.rect(2.43, 6.485, 2, 2.375, "F"); // Background
        pdf.setFillColor("white"); // 
        pdf.rect(2.43 + 1 - (1.5 / 2), 6.79, 1.5, 1.5, "F"); // Inner white square
        pdf.addImage(alumno.qrImage, "PNG", 2.43 + 1 - (1.39 / 2), 6.79 + 1.5 / 2 - 1.39 / 2, 1.39, 1.39);
        pdf.setFontSize(5.65);
        pdf.setTextColor("white");
        pdf.setFont("Montserrat", "bold");
        pdf.text(`ESCANEAR QR`, 2.42 + 1 - (1.5 / 2), 8.6);
        //QR section

        //Top black rectangle
        pdf.setFillColor(35, 31, 32); // Same color as the original shape
        pdf.rect(4.6, 4.63, 5.55, 0.38, "F"); // Draw the rectangle
        auxtextWidth = pdf.getTextWidth("AUTORIZACION MANEJO SEGURO AUTOELEVADOR")
        auxtextHeight = pdf.getTextDimensions("AUTORIZACION MANEJO SEGURO AUTOELEVADOR").h;
        auxtextHeight = auxtextHeight * 0.75;// Substracting 25% of the height representing the top margin
        pdf.text("AUTORIZACION MANEJO SEGURO AUTOELEVADOR", 4.6 + 5.55 / 2 - auxtextWidth / 2, 4.63 + auxtextHeight / 2 + 0.38 / 2);
        //Top black rectangle

        pdf.setTextColor(237, 28, 36); // Red
        pdf.setFontSize(8);
        pdf.addImage(person_icon, "PNG", 4.62, 5.39, 0.32, 0.4);

        const nombreCompleto = alumno.apellido.toUpperCase() + ", " + alumno.nombre.toUpperCase();
        let fontSize = 8
        while (pdf.getTextWidth(nombreCompleto) > 5.2) {
            fontSize -= 0.1;
            pdf.setFontSize(fontSize);
        }



        pdf.text(nombreCompleto, 5, 5.7)

        pdf.setFontSize(8);
        pdf.setFont("IBMPlex", "normal"); // Using normal (non-bold) for regular text
        pdf.setTextColor(109, 110, 113);
        pdf.text("DNI: " + alumno.dni, 4.63, 6.39);
        pdf.text("FECHA: " + formatDate(alumno.fecha_1), 4.63, 6.78);

        pdf.setTextColor(237, 28, 36); // Red
        pdf.setFont("IBMPlex", "bold"); // Using normal (non-bold) for regular text 
        pdf.text("VENCE: " + formatDate(alumno.fecha_vencimiento), 4.63, 7.18);
        pdf.setTextColor(109, 110, 113);
        pdf.setFont("IBMPlex", "normal"); // Using normal (non-bold) for regular text
        pdf.setFontSize(6);
        pdf.text("Alcance: Vehículos hasta 3500 kg.", 4.63, 7.61);

        pdf.addImage(firmaPNG, "PNG", 8.75, 7.07, 1.3, 1.6);
        pdf.addImage(cursos29_logo, "PNG", 7.72, 5.98, 1.85, 1.85);


        pdf.setFont("Montserrat", "bold");
        pdf.setFontSize(6.5);
        pdf.text("Instructor: Lic. Alan Guerrero", 4.63, 8.1);

        pdf.setDrawColor(209, 211, 212); // Sets a light grey color
        pdf.rect(position.x, position.y, 8.26, 5.4, "S"); // Draw the rectangle      
    })




    if (download) {
        pdf.setProperties({ title: "Carnet.pdf" });

        const fileName = `${csvData.apellido}, ${csvData.nombre} - Carnet Res 960 SRT.pdf`;
        pdf.save(fileName);
    } else {
        const pdfBlob = pdf.output("blob", { title: "Carnet.pdf" });
        const fileURL = URL.createObjectURL(pdfBlob);
        window.open(fileURL, "_blank");
    }

    return true
};
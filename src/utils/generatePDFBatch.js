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


    let y_correction = 0;
    csvData.map((alumno, index) => {
        
        const cardHeight = 5.4;
        const cardWidth = 8.26;
        if(index % 10 === 0 && index !== 0) 
            {
                y_correction = cardHeight*5 * index/10
            }
    
        
       
        const position = { x: 2.25 + (index === 1 ? 1 : index%2)*cardWidth, y: 1.2 + cardHeight*Math.floor(index/2) - y_correction };
        
        if (index % 10 === 0 && index !== 0) {        
            pdf.addPage();
        }

        pdf.setLineWidth(0.035); // Makes the border thinner


        // Add Image (either from URL or File)
        pdf.addImage(alumno.imageFile, "JPEG", position.x + 0.35, position.y + 0.3, 2, 2);//Carnet photo


        //First credential square

        //Bottom black rectangle
        pdf.setFillColor(35, 31, 32); // Same color as the original shape
        pdf.rect(position.x, position.y + 4.565, 8.26, 0.85, "F"); // Draw the rectangle
        pdf.setFillColor("white"); // Same color as the original shape
        pdf.rect(position.x, position.y + 4.125, 8.26, 0.55, "F"); // Covers only the top part

        pdf.setFont("Montserrat", "normal");
        pdf.setTextColor("white");
        pdf.setFontSize(6.5);
        let auxtextWidth = pdf.getTextWidth("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T")
        let auxtextHeight = pdf.getTextDimensions("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T").h;
        auxtextHeight = auxtextHeight * 0.75;// Substracting 25% of the height representing the top margin
        pdf.text("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T", position.x + 8.28 / 2 - auxtextWidth / 2, position.y + 4.675 + auxtextHeight / 2 + 0.72 / 2);
        //Bottom black rectangle

        //QR section
        pdf.setFillColor(237, 28, 36); // Red
        pdf.rect(position.x + 0.35, position.y + 2.3, 2, 2.375, "F"); // Background
        pdf.setFillColor("white"); // 
        pdf.rect(position.x + 0.35 + 1 - (1.5 / 2), position.y + 2.605, 1.5, 1.5, "F"); // Inner white square
        pdf.addImage(alumno.qrImage, "PNG", position.x + 0.35 + 1 - (1.39 / 2), position.y + 2.605 + 1.5 / 2 - 1.39 / 2, 1.39, 1.39);
        pdf.setFontSize(5.65);
        pdf.setTextColor("white");
        pdf.setFont("Montserrat", "bold");
        pdf.text(`ESCANEAR QR`, position.x + 0.34 + 1 - (1.5 / 2), position.y + 4.415);
        //QR section

        //Top black rectangle
        pdf.setFillColor(35, 31, 32); // Same color as the original shape
        pdf.rect(position.x + 2.52, position.y + 0.445, 5.55, 0.38, "F"); // Draw the rectangle
        auxtextWidth = pdf.getTextWidth("AUTORIZACION MANEJO SEGURO AUTOELEVADOR")
        auxtextHeight = pdf.getTextDimensions("AUTORIZACION MANEJO SEGURO AUTOELEVADOR").h;
        auxtextHeight = auxtextHeight * 0.75;// Substracting 25% of the height representing the top margin
        pdf.text("AUTORIZACION MANEJO SEGURO AUTOELEVADOR", position.x + 2.52 + 5.55 / 2 - auxtextWidth / 2, position.y + 0.445 + auxtextHeight / 2 + 0.38 / 2);
        //Top black rectangle

        pdf.setTextColor(237, 28, 36); // Red
        pdf.setFontSize(8);
        pdf.addImage(person_icon, "PNG", position.x + 2.54, position.y + 1.205, 0.32, 0.4);

        const nombreCompleto = alumno.apellido.toUpperCase() + ", " + alumno.nombre.toUpperCase();
        let fontSize = 8
        while (pdf.getTextWidth(nombreCompleto) > 5.2) {
            fontSize -= 0.1;
            pdf.setFontSize(fontSize);
        }



        pdf.text(nombreCompleto, position.x + 2.92, position.y + 1.515)

        pdf.setFontSize(8);
        pdf.setFont("IBMPlex", "normal"); // Using normal (non-bold) for regular text
        pdf.setTextColor(109, 110, 113);
        pdf.text("DNI: " + alumno.dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), position.x + 2.55, position.y + 2.205);
        pdf.text("FECHA: " + alumno.fecha_1, position.x + 2.55, position.y + 2.595);

        pdf.setTextColor(237, 28, 36); // Red
        pdf.setFont("IBMPlex", "bold"); // Using normal (non-bold) for regular text 
        pdf.text("VENCE: " + alumno.fecha_vencimiento, position.x + 2.55, position.y + 2.995);
        pdf.setTextColor(109, 110, 113);
        pdf.setFont("IBMPlex", "normal"); // Using normal (non-bold) for regular text
        pdf.setFontSize(6);
        pdf.text("Alcance: Vehículos hasta 3500 kg.", position.x + 2.55, position.y + 3.425);

        pdf.addImage(firmaPNG, "PNG", position.x + 6.67, position.y + 2.885, 1.3, 1.6);
        pdf.addImage(cursos29_logo, "PNG", position.x + 5.64, position.y + 1.795, 1.85, 1.85);


        pdf.setFont("Montserrat", "bold");
        pdf.setFontSize(6.5);
        pdf.text("Instructor: Lic. Alan Guerrero", position.x + 2.55, position.y + 3.915);

        pdf.setDrawColor(35, 31, 32); // Sets a light grey color
        pdf.setLineWidth(0.005); // Makes the border thinner
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
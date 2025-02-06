import { jsPDF } from "jspdf";
import cursos29_logo from "../assets/cursos29_logo.png";
import firmaPNG from "../assets/firma.png";
import { montserratFont } from "../assets/fonts/Montserrat-Regular-normal";
import {ibmplexFont} from "../assets/fonts/IBMPlexSans-Regular-normal";
import {ibmplexBoldFont} from "../assets/fonts/IBMPlexSans-Bold-bold";
import {montserratBoldFont} from "../assets/fonts/Montserrat-Bold-bold";



export const generatePDF = (qrValue, formData) => {
    console.log("QR Value:", qrValue);
    console.log("Form Data:", formData);
    console.log("Apellido:", formData.apellido);
    
    
    
    if (!qrValue) return;

    const pdf = new jsPDF("portrait", "cm", "a4");

    pdf.addFileToVFS("IBMPlexSans-Regular.ttf", ibmplexFont);
    pdf.addFont("IBMPlexSans-Regular.ttf", "IBMPlex", "normal");

    pdf.addFileToVFS("IBMPlexSans-Bold.ttf", ibmplexBoldFont);
    pdf.addFont("IBMPlexSans-Bold.ttf", "IBMPlex", "bold");

    pdf.addFileToVFS("Montserrat-Regular.ttf", montserratFont);
    pdf.addFont("Montserrat-Regular.ttf", "Montserrat", "normal");

    pdf.addFileToVFS("Montserrat-Bold.ttf", montserratBoldFont);
    pdf.addFont("Montserrat-Bold.ttf", "Montserrat", "bold");

    const footer = (pdf) => {
      pdf.setFontSize(10.5);
      pdf.setFont("Montserrat", "bold");
      pdf.setTextColor(35, 31, 32);    
      
      pdf.getTextWidth("www.cursos29.com.ar")
      const textWidth= pdf.getTextWidth("www.cursos29.com.ar | 0810 220 1029")
      const auxtextWidth= pdf.getTextWidth("www.cursos29.com.ar ")
  
      const pageWidth = pdf.internal.pageSize.width; // Get page width
      let x = (pageWidth/2) - (textWidth/2); // Calculate X position
      pdf.text("www.cursos29.com.ar", x, 27.80);
      
  
      pdf.setTextColor("black");
      pdf.setFont("Montserrat", "normal");
      pdf.setTextColor(35, 31, 33);
      x = (pageWidth/2) - (textWidth/2) + auxtextWidth; // Calculate X position
      pdf.text("| 0810 220 1029", x, 27.80);
      addCenterAlignedText(pdf, "Whatsapp Comercial: 1158059750", 28.20);
    }


    const addRightAlignedText = (pdf, text, y, marginRight = 1.5) => {
      const pageWidth = pdf.internal.pageSize.width; // Get page width
      const textWidth = pdf.getTextWidth(text); // Get text width
      const x = pageWidth - textWidth - marginRight; // Calculate X position
  
      pdf.text(text, x, y); // Draw text
  };

  const addCenterAlignedText = (pdf, text, y) => {
    const pageWidth = pdf.internal.pageSize.width; // Get page width
    const textWidth = pdf.getTextWidth(text); // Get text width
    const x = (pageWidth/2) - (textWidth/2); // Calculate X position

    pdf.text(text, x, y); // Draw text
};

const addCenterAlignedImage = (pdf, image, format,  y, height, width) => {
  const pageWidth = pdf.internal.pageSize.width; // Get page width
  const x = (pageWidth/2) - (width/2); // Calculate X position

  pdf.addImage(image,format, x, y, height, width);
};
    

    // Set font size
    pdf.setFontSize(16);

    // Add QR Code
    const qrCanvas = document.getElementById("qr-code").querySelector("canvas");
    if (qrCanvas) {
      const qrImage = qrCanvas.toDataURL("image/png");
      pdf.addImage(qrImage, "PNG", 17.66, 1.71, 1.46, 1.46);
    }

    // Set bold for specific text
    pdf.setFontSize(5);

    pdf.text(`ESCANEAR QR`, 17.67, 3.47);

    // Add logo
    addCenterAlignedImage(pdf, cursos29_logo,"PNG", 2.8, 3.5, 3.5);

    // Add Image (either from URL or File)
    pdf.addImage(formData.imageFile, "JPEG", 70, 70, 50, 50);

    // Set font and size for the certificate title

    pdf.setFont("Montserrat", "bold"); // Using normal (non-bold) for regular text
    pdf.setFontSize(19);
    pdf.setTextColor(35, 31, 32);
    addCenterAlignedText(pdf, "CERTIFICADO DE APROBACION", 7.93);
        
    // Set Montserrat-Regular font and size for the name
    pdf.setFontSize(13);
    pdf.setTextColor("black");

    pdf.setFont("Montserrat", "normal"); // Using normal (non-bold) for regular text
    addCenterAlignedText(pdf, formData.apellido.toUpperCase() + ", " + formData.nombre.toUpperCase() , 9.30);
    
    pdf.setFont("IBMPlex", "normal"); // Using normal (non-bold) for regular text
    pdf.setFontSize(13);
    pdf.setTextColor(109, 110, 113);
    addCenterAlignedText(pdf, formData.dni, 10.02);
    pdf.setTextColor("black");


    pdf.setFont("Montserrat", "normal"); // Using normal (non-bold) for regular text
    pdf.setFontSize(14);
    pdf.text("A quien corresponda:", 1.08, 12.53);

    pdf.setTextColor(35, 31, 32);
    pdf.setFontSize(13.5);

 
    pdf.text("Mediante el presente Certificado de Aprobación se deja constancia que completó satisfactoriamente el curso teórico-práctico de “OPERACIÓN SEGURA DE AUTOELEVADORES” acorde a la Resolución 960/15 S.R.T. desarrollado por nuestro Centro de Capacitación, donde se extiende el carnet correspondiente de 1 año de validez.", 1.04, 14.27, {maxWidth: 18, align: 'justify'} );
    

    pdf.setTextColor("black");

    pdf.text("Atentamente,", 1.11, 18.42);

    pdf.addImage(firmaPNG, "JPEG", 16.17, 19.65, 2.59, 3.33);

    pdf.setFont("Montserrat", "bold");
    pdf.setTextColor(35, 31, 32);
    
    addRightAlignedText(pdf, "Alan Gastón Guerrero", 23.35);
    pdf.setFont("Montserrat", "normal");

    addRightAlignedText(pdf, "Lic. en Higiene y Seguridad en el Trabajo", 23.95);
    addRightAlignedText(pdf, "CPSH LHS-000389 PBA", 24.55);
    addRightAlignedText(pdf, "Instructor", 25.15);

    // Footer
    footer(pdf)
   
    // Footer

    pdf.addPage();

    pdf.setLineWidth(0.035); // Makes the border thinner
    pdf.setDrawColor(209, 211, 212); // Sets a light grey color
    pdf.roundedRect(2.1, 4.20, 8.25, 5.4, 0.15, 0.15, "S"); // Draw the rectangle
    pdf.roundedRect(10.5, 4.20, 8.25, 5.4, 0.15, 0.15, "S"); // Draw the rectangle

    // Footer
    footer(pdf)
    // Footer




    // Save the PDF
    const pdfBlob = pdf.output("blob");
    const pdfURL = URL.createObjectURL(pdfBlob);
    window.open(pdfURL, "_blank");
    // pdf.save("user_qr.pdf");
  };
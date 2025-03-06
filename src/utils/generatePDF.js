import { jsPDF } from "jspdf";
import cursos29_logo from "../assets/cursos29_logo.png";
import firmaPNG from "../assets/firma.png";
import clark_logo from "../assets/clark_logo.png";
import cursos29_logo2 from "../assets/cursos29_logo_2.png";
import person_icon from "../assets/person_icon.png";
import whatsapp_icon from "../assets/whatsapp_icon.png";
import { montserratFont } from "../assets/fonts/Montserrat-Regular-normal";
import { ibmplexFont } from "../assets/fonts/IBMPlexSans-Regular-normal";
import { ibmplexBoldFont } from "../assets/fonts/IBMPlexSans-Bold-bold";
import { montserratBoldFont } from "../assets/fonts/Montserrat-Bold-bold";



export const generatePDF = (formData, download) => {

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
    const textWidth = pdf.getTextWidth("www.cursos29.com.ar | 0810 220 1029")
    const auxtextWidth = pdf.getTextWidth("www.cursos29.com.ar ")

    const pageWidth = pdf.internal.pageSize.width; // Get page width
    let x = (pageWidth / 2) - (textWidth / 2); // Calculate X position
    pdf.text("www.cursos29.com.ar", x, 27.80);

    pdf.setTextColor("black");
    pdf.setFont("Montserrat", "normal");
    pdf.setTextColor(35, 31, 33);
    x = (pageWidth / 2) - (textWidth / 2) + auxtextWidth; // Calculate X position
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
    const x = (pageWidth / 2) - (textWidth / 2); // Calculate X position

    pdf.text(text, x, y); // Draw text
  };

  const addCenterAlignedImage = (pdf, image, format, y, height, width) => {
    const pageWidth = pdf.internal.pageSize.width; // Get page width
    const x = (pageWidth / 2) - (width / 2); // Calculate X position

    pdf.addImage(image, format, x, y, height, width);
  };

  const formatDate = (date) => {
    const formatedDate = new Date(date); // Ensure it's a Date object
    const day = String(formatedDate.getUTCDate()).padStart(2, "0");
    const month = String(formatedDate.getUTCMonth() + 1).padStart(2, "0");
    const year = formatedDate.getUTCFullYear();
    return (`${day}/${month}/${year}`);
    }


  // Set font size
  pdf.setFontSize(16);

  // Add QR Code
  // const qrCanvas = document.getElementById("qr-code").querySelector("canvas");
  // const qrImage = qrCanvas.toDataURL("image/png");

  pdf.addImage(formData.qrImage, "PNG", 17.66, 1.71, 1.46, 1.46);

  // Set bold for specific text
  pdf.setFontSize(5);

  pdf.text(`ESCANEAR QR`, 17.67, 3.47);

  // Add logo
  addCenterAlignedImage(pdf, cursos29_logo, "PNG", 2.8, 3.5, 3.5);

 

  // Set font and size for the certificate title

  pdf.setFont("Montserrat", "bold"); // Using normal (non-bold) for regular text
  pdf.setFontSize(19);
  pdf.setTextColor(35, 31, 32);
  addCenterAlignedText(pdf, "CERTIFICADO DE APROBACION", 7.93);

  // Set Montserrat-Regular font and size for the name
  pdf.setFontSize(13);
  pdf.setTextColor("black");

  pdf.setFont("Montserrat", "normal"); // Using normal (non-bold) for regular text
  addCenterAlignedText(pdf, formData.apellido.toUpperCase() + ", " + formData.nombre.toUpperCase(), 9.30);

  pdf.setFont("IBMPlex", "normal"); // Using normal (non-bold) for regular text
  pdf.setFontSize(13);
  pdf.setTextColor(109, 110, 113);
  if (formData.dni.includes('.'))
    {
      addCenterAlignedText(pdf, formData.dni, 10.02);
    }  
    else
    {
      addCenterAlignedText(pdf, formData.dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 10.02);
    }
  
  pdf.setTextColor(237, 28, 36); // Red
  pdf.setFont("IBMPlex", "bold"); // Using normal (non-bold) for regular text 
  addCenterAlignedText(pdf, "VENCE: " + formatDate(formData.fecha_vencimiento), 11);
  
  
  
  pdf.setTextColor("black");
  pdf.setFont("Montserrat", "normal"); // Using normal (non-bold) for regular text
  pdf.setFontSize(14);
  pdf.text("A quien corresponda:", 1.08, 12.53);

  pdf.setTextColor(35, 31, 32);
  pdf.setFontSize(13.5);


  pdf.text("Mediante el presente Certificado de Aprobación se deja constancia que completó satisfactoriamente el curso teórico-práctico de “OPERACIÓN SEGURA DE AUTOELEVADORES” acorde a la Resolución 960/15 S.R.T. desarrollado por nuestro Centro de Capacitación, donde se extiende el carnet correspondiente de 1 año de validez.", 1.04, 14.27, { maxWidth: 18, align: 'justify' });


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
  

   // Add Image (either from URL or File)
  pdf.addImage(formData.imageFile, "JPEG", 2.43, 4.485, 2, 2);//Carnet photo


  //First credential square

  //Bottom black rectangle
  pdf.setFillColor(35, 31, 32); // Same color as the original shape
  pdf.roundedRect(2.08, 8.75, 8.26, 0.85, 0.15, 0.15, "F"); // Draw the rectangle
  pdf.setFillColor("white"); // Same color as the original shape
  pdf.rect(2.08, 8.31, 8.26, 0.55, "F"); // Covers only the top part

  pdf.setTextColor("white");
  pdf.setFontSize(6.5);
  let auxtextWidth =  pdf.getTextWidth("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T")
  let auxtextHeight = pdf.getTextDimensions("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T").h;
  auxtextHeight = auxtextHeight * 0.75;// Substracting 25% of the height representing the top margin
  pdf.text("En cumplimiento al Art. 12 de la Resolución 960/2015 de la S.R.T", 2.08 + 8.28/2 - auxtextWidth/2, 8.86 + auxtextHeight/2 + 0.72/2);
  //Bottom black rectangle

  //QR section
  pdf.setFillColor(237, 28, 36); // Red
  pdf.rect(2.43, 6.485, 2, 2.375, "F"); // Background
  pdf.setFillColor("white"); // 
  pdf.rect(2.43 + 1 - (1.5/2), 6.79, 1.5, 1.5, "F"); // Inner white square
  pdf.addImage(formData.qrImage, "PNG", 2.43 + 1 - (1.39/2), 6.79 + 1.5/ 2 - 1.39/2, 1.39, 1.39);  
  pdf.setFontSize(5.65);
  pdf.setTextColor("white");
  pdf.setFont("Montserrat", "bold");
  pdf.text(`ESCANEAR QR`, 2.42 + 1 - (1.5/2), 8.6);
  //QR section

  //Top black rectangle
  pdf.setFillColor(35, 31, 32); // Same color as the original shape
  pdf.rect(4.6, 4.63, 5.55, 0.38, "F"); // Draw the rectangle
  auxtextWidth =  pdf.getTextWidth("AUTORIZACION MANEJO SEGURO AUTOELEVADOR")
  auxtextHeight = pdf.getTextDimensions("AUTORIZACION MANEJO SEGURO AUTOELEVADOR").h;
  auxtextHeight = auxtextHeight * 0.75;// Substracting 25% of the height representing the top margin
  pdf.text("AUTORIZACION MANEJO SEGURO AUTOELEVADOR", 4.6 + 5.55/2 - auxtextWidth/2, 4.63 + auxtextHeight/2 + 0.38/2);
  //Top black rectangle

  pdf.setTextColor(237, 28, 36); // Red
  pdf.setFontSize(8);
  pdf.addImage(person_icon, "PNG", 4.62, 5.39, 0.32, 0.4);

  const nombreCompleto = formData.apellido.toUpperCase() + ", " + formData.nombre.toUpperCase();
  let fontSize = 8    
  while(pdf.getTextWidth(nombreCompleto) > 5.2)
  {
    fontSize -= 0.1;
    pdf.setFontSize(fontSize);
  }




  pdf.text(nombreCompleto, 5, 5.7)

  pdf.setFontSize(8);
  pdf.setFont("IBMPlex", "normal"); // Using normal (non-bold) for regular text
  pdf.setTextColor(109, 110, 113);
  if (formData.dni.includes('.'))
  {
    pdf.text("DNI: " + formData.dni, 4.63, 6.39);
  }  
  else
  {
    pdf.text("DNI: " + formData.dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),  4.63, 6.39);
  }
  pdf.text("FECHA: " + formatDate(formData.fecha_emision), 4.63, 6.78);

  pdf.setTextColor(237, 28, 36); // Red
  pdf.setFont("IBMPlex", "bold"); // Using normal (non-bold) for regular text 
  pdf.text("VENCE: " + formatDate(formData.fecha_vencimiento), 4.63, 7.18);
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
  pdf.roundedRect(2.08, 4.185, 8.26, 5.4, 0.15, 0.15, "S"); // Draw the rectangle



  //Second credential square
  pdf.roundedRect(10.505, 4.185, 8.26, 5.4, 0.15, 0.15, "S"); // Draw the rectangle

  pdf.addImage(clark_logo, "PNG", 11.03, 4.62, 1.08, 1.08);
  pdf.setTextColor(237, 28, 36); // Red
  pdf.setFontSize(20);
  pdf.text("IMPORTANTE!", 12.87, 5.45)
  pdf.addImage(cursos29_logo2, "PNG", 17.02, 7.81, 1.28, 1.28);
  pdf.setFillColor("black"); 
  pdf.setFont("Montserrat", "normal");
  pdf.setTextColor("black");
  pdf.setFontSize(5.5);
  pdf.circle(11.07, 6.18, 0.035, "F");
  pdf.text("Inspeccione el equipo antes de cada uso.", 11.30, 6.24)
  pdf.circle(11.07, 6.44, 0.035, "F");
  pdf.text("Informe desperfectos o daños del equipo", 11.30, 6.5)
  pdf.circle(11.07, 6.7, 0.035, "F");
  pdf.text("Si es necesario hacer reparaciones, coloque un rótulo bien", 11.30, 6.76)
  pdf.text('visible: "NO OPERAR" y retire la llave de arranque', 11.30, 7.02);
  pdf.text('Conduzca lentamente en curvas.', 11.30, 7.28);
  pdf.circle(11.07, 7.22, 0.035, "F");
  pdf.circle(11.07, 7.48, 0.035, "F");
  pdf.text('No transportar personas.', 11.30, 7.54);
  pdf.circle(11.07, 7.74, 0.035, "F");
  pdf.text('No estacionar en pendientes ni salida de emergencia.', 11.30, 7.8);
  pdf.circle(11.07, 8, 0.035, "F");
  pdf.text('Utilice SIEMPRE el cinturon de seguridad.', 11.30, 8.06);
  pdf.circle(11.07, 8.26, 0.035, "F");
  pdf.text('Tenga su carnet vigente.', 11.30, 8.32);

  pdf.setFont("Montserrat", "bold");   
  pdf.addImage(whatsapp_icon, "PNG", 11, 8.82, 0.3, 0.3);

    pdf.text("1158059750 | 0810 220 1029 | www.cursos29.com.ar", 11.44, 9.05)

  // Footer
  footer(pdf)
  // Footer

  if (download) {
    pdf.setProperties({ title: "Carnet.pdf" });
    
    const fileName = `${formData.apellido}, ${formData.nombre} - Carnet Res 960 SRT.pdf`;
    pdf.save(fileName);
  } else {
    const pdfBlob = pdf.output("blob", { title: "Carnet.pdf" });
    const fileURL = URL.createObjectURL(pdfBlob);
    window.open(fileURL, "_blank");
  }

  return true
};
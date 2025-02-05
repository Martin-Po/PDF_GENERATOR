import { jsPDF } from "jspdf";
import cursos29_logo from "../assets/cursos29_logo.png";
import firmaPNG from "../assets/firma.png";
import { font } from "../assets/fonts/Montserrat-Regular-normal";

export const generatePDF = (qrValue, formData) => {
    console.log("QR Value:", qrValue);
    console.log("Form Data:", formData);
    console.log("Apellido:", formData.apellido);
    
    
    
    if (!qrValue) return;

    const pdf = new jsPDF("portrait", "cm", "a4");

    // Add Montserrat-Regular font to the VFS (replace this with your actual base64-encoded font string)
    const ibmPlexSansBold = `<base64-encoded-font>`; // Replace with your actual base64 data

    pdf.addFileToVFS("IBMPlexSans-Bold.ttf", ibmPlexSansBold);

    pdf.addFileToVFS("Montserrat-Regular.ttf", font);
    pdf.addFont("Montserrat-Regular.ttf", "Montserrat", "normal");
    

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
    pdf.addImage(cursos29_logo, "PNG", 8.52, 2.63, 3.94, 3.94);

    // Add Image (either from URL or File)
    pdf.addImage(formData.imageFile, "JPEG", 70, 70, 50, 50);

    // Set font and size for the certificate title
    pdf.setFont("Courier", "bold"); // Using normal (non-bold) for regular text

    pdf.setFontSize(19);
    pdf.text("CERTIFICADO DE APROBACION", 5.59, 7.93);

    // Set Montserrat-Regular font and size for the name
    pdf.setFont("Montserrat", "normal"); // Using normal (non-bold) for regular text
    pdf.setFontSize(13);
    pdf.text(formData.apellido.toUpperCase() + ", " + formData.nombre.toUpperCase(), 7.15, 8.81);

    pdf.setFont("IBMPlexSans-Bold");
    pdf.setFontSize(13);
    pdf.text(formData.dni, 9.45, 9.52);

    pdf.setFont("undefined", "normal"); // Using normal (non-bold) for regular text
    pdf.setFontSize(19);
    pdf.text("A quien corresponda:", 1.08, 12.53);

    pdf.setFont("Montserrat", "normal"); // Using normal (non-bold) for regular text
    pdf.setFontSize(15);
    pdf.text("Mediante el presente Certificado de Aprobación se deja constancia que", 1.04, 14.27, {maxWidth: 19, align: 'justify'} );
    pdf.text("completó satisfactoriamente el curso teórico-práctico de “OPERACIÓN", 1.04, 14.90, {maxWidth: 19, align: 'justify'} );
    pdf.text("SEGURA DE AUTOELEVADORES” acorde a la Resolución 960/15 S.R.T.", 1.04, 15.50, {maxWidth: 19, align: 'justify'} );
    pdf.text("desarrollado por nuestro Centro de Capacitación, donde se extiende el", 1.04, 16, {maxWidth: 19, align: 'justify'} );
    pdf.text("carnet correspondiente de 1 año de validez.", 1.04, 16.40, {maxWidth: 19, align: 'justify'} );


    pdf.text("Atentamente,", 1.11, 18.42);

    pdf.addImage(firmaPNG, "JPEG", 16.17, 19.65, 2.59, 3.33);

    pdf.setFont("undefined", "bold");
    
    pdf.text("Alan Gastón Guerrero", 14.33, 23.17);
    
    pdf.setFont("undefined", "normal");

    pdf.text("Lic. en Higiene y Seguridad en el Trabajo", 10.5, 23.75);
    pdf.text("CPSH LHS-000389 PBA", 14.1, 24.33);
    pdf.text("Instructor", 17.32, 24.87);

    // Footer
    pdf.setFontSize(12);
    pdf.setFont("undefined", "bold");
    pdf.text("www.cursos29.com.ar", 6.49, 27.6);
    pdf.setFont("undefined", "normal");
    pdf.text("| 0810 220 1029", 11.26, 27.6);
    pdf.text("Whatsapp Comercial: 1158059750", 7.43, 27.95);
    // Footer

    pdf.addPage();

    pdf.setLineWidth(0.035); // Makes the border thinner
    pdf.setDrawColor(200, 200, 200); // Sets a light grey color
    pdf.roundedRect(2.1, 4.25, 16.62, 5.4, 0.15, 0.15, "S"); // Draw the rectangle

    // Footer
    pdf.setFontSize(12);
    pdf.setFont("undefined", "bold");
    pdf.text("www.cursos29.com.ar", 6.49, 27.6);
    pdf.setFont("undefined", "normal");
    pdf.text("| 0810 220 1029", 11.26, 27.6);
    pdf.text("Whatsapp Comercial: 1158059750", 7.43, 27.95);
    // Footer




    // Save the PDF
    const pdfBlob = pdf.output("blob");
    const pdfURL = URL.createObjectURL(pdfBlob);
    window.open(pdfURL, "_blank");
  };
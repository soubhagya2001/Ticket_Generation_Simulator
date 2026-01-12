import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";
import moment from "moment";

export const generateTicketDOCX = async (ticketData) => {
  try {
    const templatePath = path.resolve("ticketTemplates", "normal_template.docx");
    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const passenger = ticketData.passengers[0] || {};
    
    const viewData = {
      starting_place: ticketData.fromStation,
      start_date: moment(ticketData.departureDate).format('DD-MM-YYYY'),
      ending_place: ticketData.toStation,
      end_date: moment(ticketData.arrivalDate).format('DD-MM-YYYY'),
      pnr: ticketData.pnr,
      train_name: `${ticketData.trainName} (${ticketData.trainNo})`,
      train_class: ticketData.trainClass,
      quota: ticketData.quota,
      distance: ticketData.distance,
      booking_date_time: moment(ticketData.bookingDate).format('DD-MM-YYYY HH:mm'),
      passenger_name: passenger.name,
      age: passenger.age,
      gender: passenger.gender,
      booking_status: passenger.bookingStatus,
      current_status: passenger.currentStatus,
      transaction_id: ticketData.transactionId || 'TXN' + Math.floor(Math.random() * 1000000000),
      ticket_price: ticketData.ticketFare,
      convenience_fee: ticketData.convenienceFee,
      total_price: (parseFloat(ticketData.ticketFare) + parseFloat(ticketData.convenienceFee)).toFixed(2),
      invoice_number: ticketData.invoiceNo,
      passengers: ticketData.passengers.map(p => ({
        name: p.name,
        age: p.age,
        gender: p.gender,
        booking_status: p.bookingStatus,
        current_status: p.currentStatus,
        coach: p.coach,
        seat: p.seat
      }))
    };

    doc.render(viewData);

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return buf;
  } catch (error) {
    console.error("Error in generateTicketDOCX:", error);
    throw error;
  }
};

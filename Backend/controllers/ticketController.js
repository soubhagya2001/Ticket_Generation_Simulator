import { generateTicketDOCX } from "../services/ticketService.js";

export const generateTicket = async (req, res) => {
  try {
    const ticketData = req.body;
    
    if (!ticketData) {
      return res.status(400).json({ error: "No ticket data provided" });
    }

    const docxBuffer = await generateTicketDOCX(ticketData);

    // Set headers for Word document
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket_${ticketData.pnr || "generated"}.docx`
    );
    
    res.send(docxBuffer);
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ 
      error: "Failed to generate ticket", 
      details: error.message 
    });
  }
};

// e:\Web dev projects\Ticket_Generator\Backend\services\ticketService.js
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";
import moment from "moment";
import QRCode from "qrcode";
import AdmZip from "adm-zip";

const CLASS_MAP = {
  'SL': 'SLEEPER CLASS (SL)',
  '3A': 'AC 3 TIER (3A)',
  '2A': 'AC 2 TIER (2A)',
  '1A': 'AC FIRST CLASS (1A)',
  '2S': 'SECOND SITTING (2S)',
  'CC': 'AC CHAIR CAR (CC)',
  'GN': 'GENERAL (GN)',
  '3E': '3 AC ECONOMY (3E)'
};

export const generateTicketDOCX = async (ticketData) => {
  try {
    const templatePath = path.resolve("ticketTemplates", "normal_template.docx");
    const content = fs.readFileSync(templatePath, "binary");
    
    // 1. First, fill text placeholders using docxtemplater
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const passenger = ticketData.passengers[0] || {};
    const journeyDate = moment(ticketData.departureDate).format('DD-MMM-YYYY');
    const fullTrainClass = CLASS_MAP[ticketData.trainClass] || ticketData.trainClass;
    
    // Status format: CNF/S1/12/UPPER
    const formatStatus = (p) => {
      const parts = [
        p.bookingStatus,
        p.coach,
        p.seat,
        p.seatType || 'UPPER'
      ];
      return parts.filter(Boolean).join('/');
    };

    const firstPassengerStatus = formatStatus(passenger);

    const viewData = {
      starting_place: ticketData.fromStation,
      from_stn_code: ticketData.fromStationCode,
      ending_place: ticketData.toStation,
      end_std: ticketData.toStationCode,
      start_date: moment(ticketData.departureDate).format('DD-MMM-YYYY'),
      dept_time: moment(ticketData.departureTime, ['HH.mm', 'HH:mm']).format('HH:mm'),
      end_date: moment(ticketData.arrivalDate).format('DD-MMM-YYYY'),
      pnr: ticketData.pnr,
      train_name: ticketData.trainName,
      train_no: ticketData.trainNo,
      train_class: fullTrainClass,
      booking_date_time: moment(ticketData.bookingDate).format('DD-MMM-YYYY HH:mm:ss') + " HRS",
      quota: ticketData.quota,
      distance: ticketData.distance,
      invoice_number: ticketData.invoiceNo,
      transaction_id: ticketData.transactionId || '100006163942872',
      // For compatibility with single passenger templates
      passenger_name: passenger.name,
      age: passenger.age,
      gender: passenger.gender,
      booking_status: firstPassengerStatus,
      current_status: firstPassengerStatus,
      // For multiple passenger tables using {#passengers} ... {/passengers}
      passengers: ticketData.passengers.map(p => ({
        ...p,
        full_status: formatStatus(p)
      })),
      ticket_price: ticketData.ticketFare,
      convenience_fee: ticketData.convenienceFee,
      total_price: (parseFloat(ticketData.ticketFare) + parseFloat(ticketData.convenienceFee)).toFixed(2),
    };

    doc.render(viewData);
    const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

    // 2. Generate QR Code Buffer
    const qrText = `PNR No.:${ticketData.pnr},
TXN ID:${ticketData.transactionId || '100006163942872'},
Passenger Name:${passenger.name},
Gender:${passenger.gender},
Age:${passenger.age},
Status:${firstPassengerStatus},
Quota:${ticketData.quota},
Train No.:${ticketData.trainNo},
Train Name:${ticketData.trainName},
Date Of Journey:${journeyDate},
Boarding Station:${ticketData.fromStation} - ${ticketData.fromStationCode},
Class:${fullTrainClass},
From:${ticketData.fromStation} - ${ticketData.fromStationCode},
To:${ticketData.toStation} - ${ticketData.toStationCode},
Ticket Fare: Rs${ticketData.ticketFare},
IRCTC C Fee: Rs${ticketData.convenienceFee}+PG Charges Extra`;

    const qrBuffer = await QRCode.toBuffer(qrText, { margin: 1, width: 600 });

    // 3. Use adm-zip to manually inject the QR image and update XML
    const finalZip = new AdmZip(docxBuffer);
    
    finalZip.addFile("word/media/qr.png", qrBuffer);

    let relsContent = finalZip.readAsText("word/_rels/document.xml.rels");
    const rIdMatches = relsContent.match(/Id="rId(\d+)"/g) || [];
    const rIdNumbers = rIdMatches.map(m => parseInt(m.match(/\d+/)[0]));
    const nextRIdNum = Math.max(0, ...rIdNumbers) + 1;
    const nextRId = `rId${nextRIdNum}`;

    const newRel = `<Relationship Id="${nextRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/qr.png"/>`;
    relsContent = relsContent.replace("</Relationships>", `${newRel}</Relationships>`);
    finalZip.updateFile("word/_rels/document.xml.rels", Buffer.from(relsContent));

    let docXmlContent = finalZip.readAsText("word/document.xml");

    const emuSize = 1143000; 
    const horizontalPos = 5655600; 
    const verticalPos = 496800;    
    
    const drawingXml = `
      <w:drawing>
        <wp:anchor distT="0" distB="0" distL="114300" distR="114300" simplePos="0" relativeHeight="251658240" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1" editId="50D07946" anchorId="114AD24F">
          <wp:simplePos x="0" y="0"/>
          <wp:positionH relativeFrom="page">
            <wp:posOffset>${horizontalPos}</wp:posOffset>
          </wp:positionH>
          <wp:positionV relativeFrom="page">
            <wp:posOffset>${verticalPos}</wp:posOffset>
          </wp:positionV>
          <wp:extent cx="${emuSize}" cy="${emuSize}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:wrapNone/>
          <wp:docPr id="${nextRIdNum}" name="QR Code"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="qr.png"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${nextRId}"/>
                  <a:stretch>
                    <a:fillRect/>
                  </a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${emuSize}" cy="${emuSize}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect">
                    <a:avLst/>
                  </a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:anchor>
      </w:drawing>
    `.trim();

    const placeholderRegex = /<w:t[^>]*>QR_PLACEHOLDER<\/w:t>/;
    if (placeholderRegex.test(docXmlContent)) {
      docXmlContent = docXmlContent.replace(placeholderRegex, drawingXml);
    } else {
      docXmlContent = docXmlContent.replace("QR_PLACEHOLDER", drawingXml);
    }

    finalZip.updateFile("word/document.xml", Buffer.from(docXmlContent));

    return finalZip.toBuffer();
  } catch (error) {
    console.error("Error generating ticket:", error);
    throw error;
  }
};
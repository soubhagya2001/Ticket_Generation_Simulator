import { extractClasses, extractFares, extractQuotas, extractCoachComposition, extractTrainZone } from "./misc.js";
let data2 = new String();

class Prettify {
  BetweenStation(string) {
  try {
    let arr = [];

    // ---- 1. Handle JSON Input (Objects or Strings)
    let inputData = null;
    if (typeof string === 'object') {
      inputData = string;
    } else if (typeof string === 'string' && (string.trim().startsWith('{') || string.trim().startsWith('['))) {
      try {
        inputData = JSON.parse(string);
      } catch (e) {
        // Not valid JSON, proceed to legacy parsing
      }
    }

    if (inputData) {
      if (inputData.success && Array.isArray(inputData.data)) {
        // If already in prettified format (contains train_base), return as is
        if (inputData.data.length > 0 && inputData.data[0].train_base) {
          return inputData;
        }
        // If it's a raw list of trains in JSON, map them
        arr = inputData.data.map(t => ({ train_base: t }));
      } else if (Array.isArray(inputData)) {
        arr = inputData.map(t => ({ train_base: t }));
      }

      if (arr.length > 0) {
        return {
          success: true,
          time_stamp: Date.now(),
          data: arr
        };
      }
    }

    // ---- 2. Legacy Raw String Parsing
    if (typeof string !== 'string') {
        return { success: false, time_stamp: Date.now(), data: "Invalid input type" };
    }

    // ---- Error handling (keep as-is)
    let nore = string.split("~")[5]?.split("<") || [];
    if (nore[0] === "No direct trains found") {
      return {
        success: false,
        time_stamp: Date.now(),
        data: nore[0]
      };
    }

    if (
      string.includes("Please try again after some time") ||
      string.includes("From station not found") ||
      string.includes("To station not found")
    ) {
      return {
        success: false,
        time_stamp: Date.now(),
        data: string.replaceAll("~", "")
      };
    }

    // ---- TRAIN SPLIT
    const trainBlocks = string.split("^").slice(1);

    for (const block of trainBlocks) {
      const fields = block.split("~").filter(Boolean);
      if (fields.length < 14) continue;

      const train = {
        train_no: fields[0],
        train_name: fields[1],

        source_stn_name: fields[2],
        source_stn_code: fields[3],
        dstn_stn_name: fields[4],
        dstn_stn_code: fields[5],

        from_stn_name: fields[6],
        from_stn_code: fields[7],
        to_stn_name: fields[8],
        to_stn_code: fields[9],

        from_time: fields[10],
        to_time: fields[11],
        travel_time: fields[12],
        running_days: fields[13],

        // ✅ NOW THESE WORK CORRECTLY
        quotas: extractQuotas(block),
        classes: extractClasses(block),
        fares: extractFares(block, extractCoachComposition(block)),
        coach_composition: extractCoachComposition(block),
        zone: extractTrainZone(block)
      };

      arr.push({ train_base: train });
    }

    return {
      success: true,
      time_stamp: Date.now(),
      data: arr
    };

  } catch (err) {
    console.warn(err.message);
    return {
      success: false,
      time_stamp: Date.now(),
      error: err.message
    };
  }
}


  getDayOnDate(DD, MM, YYYY) {
    let date = new Date(YYYY, MM, DD);
    let day =
      date.getDay() >= 0 && date.getDay() <= 2
        ? date.getDay() + 4
        : date.getDay() - 3;
    return day;
  }

  GetRoute(string) {
    try {
      let data = string.split("~^");
      let arr = [];
      let obj = {};
      let retval = {};
      for (let i = 0; i < data.length; i++) {
        let data1 = data[i].split("~");
        data1 = data1.filter((el) => {
          return el != "";
        });
        obj["source_stn_name"] = data1[2];
        obj["source_stn_code"] = data1[1];
        obj["arrive"] = data1[3];
        obj["depart"] = data1[4];
        obj["distance"] = data1[6];
        obj["day"] = data1[7];
        obj["zone"] = data1[9];
        arr.push(obj);
        obj = {};
      }
      retval["success"] = true;
      retval["time_stamp"] = Date.now();
      retval["data"] = arr;
      return retval;
    } catch (err) {
      console.log(err.message);
    }
  }
  
  LiveStation($){
    let arr = [];
    let obj = {};
    let retval = {};
    $('.name').each((i,el)=>{
      obj["train_no"] = $(el).text().slice(0,5)
      obj["train_name"] = $(el).text().slice(5).trim()
      obj["source_stn_name"] = $(el).next("div").text().split("→")[0].trim()
      obj["dstn_stn_name"] = $(el).next("div").text().split("→")[1].trim()
      obj["time_at"] = $(el).parent("td").next("td").text().slice(0,5)
      obj["detail"] = $(el).parent("td").next("td").text().slice(5)
      // console.log($(el).text() + " : " + $(el).next("div").text() + " : " + $(el).parent("td").next("td").text().slice(0,5))
      arr.push(obj)
      obj = {}
    })
    retval["success"] = true;
    retval["time_stamp"] = Date.now();
    retval["data"] = arr;
    return retval;
  }

  PnrStatus(string) {
    try {
      // 1. Handle JSON
      if (typeof string === 'object') {
        return { success: true, time_stamp: Date.now(), data: string.data || string };
      }
      if (typeof string === 'string' && string.trim().startsWith('{')) {
        try {
          const data = JSON.parse(string);
          return { success: true, time_stamp: Date.now(), data: data.data || data };
        } catch (e) {}
      }

      // 2. Legacy Parsing
      let retval = {};
      var pattern = /data\s*=\s*({.*?;)/;
      let match = string.match(pattern);
      if (!match) return { success: false, data: "PNR data pattern not found" };

      let jsonStr = match[0].slice(7, -1);
      let data = JSON.parse(jsonStr);
      retval["success"] = true;
      retval["time_stamp"] = Date.now();
      retval["data"] = data;
      return retval;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  CheckTrain(string) {
    try {
      let obj = {};
      let retval = {};

      // ---- 1. Handle JSON Input
      let inputData = null;
      if (typeof string === 'object') {
        inputData = string;
      } else if (typeof string === 'string' && (string.trim().startsWith('{') || string.trim().startsWith('['))) {
        try {
          inputData = JSON.parse(string);
        } catch (e) {}
      }

      if (inputData) {
        if (inputData.success && inputData.data) return inputData;
        if (inputData.train_no) {
          return {
            success: true,
            time_stamp: Date.now(),
            data: inputData
          };
        }
      }

      // ---- 2. Legacy Parsing
      if (typeof string !== 'string') return { success: false, data: "Invalid input" };

      let data = string.split("~~~~~~~~");
      if (
        data[0] === "~~~~~Please try again after some time." ||
        data[0] === "~~~~~Train not found"
      ) {
        retval["success"] = false;
        retval["time_stamp"] = Date.now();
        retval["data"] = data[0].replaceAll("~", "");
        return retval;
      }
      let data1 = data[0].split("~");
      data1 = data1.filter((el) => {
        return el != "";
      });
      if (data1[1].length > 6) {
        data1.shift();
      }
      obj["train_no"] = data1[1].replace("^", "");
      obj["train_name"] = data1[2];
      obj["from_stn_name"] = data1[3];
      obj["from_stn_code"] = data1[4];
      obj["to_stn_name"] = data1[5];
      obj["to_stn_code"] = data1[6];
      obj["from_time"] = data1[11];
      obj["to_time"] = data1[12];
      obj["travel_time"] = data1[13];
      obj["running_days"] = data1[14];
      data1 = data[1].split("~");
      data1 = data1.filter((el) => {
        return el != "";
      });
      obj["type"] = data1[11];
      obj["train_id"] = data1[12];
      obj["distance_from_to"] = data1[18];
      obj["average_speed"] = data1[19];
      retval["success"] = true;
      retval["time_stamp"] = Date.now();
      retval["data"] = obj;
      return retval;
    } catch (err) {
      console.warn(err.message);
    }
  }
}

export default Prettify;

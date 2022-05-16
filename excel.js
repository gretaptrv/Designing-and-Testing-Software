let selectedFile;
document.getElementById('input').addEventListener("change", (event) => {
        selectedFile = event.target.files[0];
    });

let data=[{"error":"1","error":"2","error":"3"}] //error check

class UIManager {
    constructor() {
        throw Error("Class UIManager cannot be instantiated.");
    }

    static resultString = "No result yet.";

    static addEL(buttonDOM, actionString, cbFunc) {
        let button = buttonDOM;
        if (actionString == "click") {
            button.addEventListener("click", cbFunc);
        } else if(actionString == "change") {
            button.addEventListener("change", cbFunc);
        }
    }

    static turnOffWarnings() {
        document.getElementsByClassName('upload-file-warn')[0].style.visibility = 'hidden';
        document.getElementsByClassName('upload-file-warn')[1].style.visibility = 'hidden';
        document.getElementById("file-uploader").style.opacity = 0.6;
    }

    static turnOnWarnings() {
        document.getElementsByClassName('upload-file-warn')[0].style.visibility = 'visible';
        document.getElementsByClassName('upload-file-warn')[1].style.visibility = 'visible';
    }

    static enableButtons() {
        document.getElementById("options-range-button").disabled = false;
        document.getElementById("options-deviation-button").disabled = false;
    }

    static disableButtons() {
        document.getElementById("options-range-button").disabled = true;
        document.getElementById("options-deviation-button").disabled = true;
    }

    static visualize(heading) {
        // if (buttonDOM.textContent == "Find range of daily submissions") {
        //     let DOMheading = document.getElementById("options-range-result-content");
        //     DOMheading.textContent = this.resultString;

        // } else if (buttonDOM.textContent == "Find trend in daily submissions") {
        //     let DOMheading = document.getElementById("options-deviation-result-content");
        //     DOMheading.textContent = this.resultString;
        // }
        heading.textContent = this.resultString;
    }
   
}

class FilePrepare {
    constructor() {
        //XLSX.utils.json_to_sheet(data, 'out.xlsx');
        if(FileManager.checkUploadedFile()){
            UIManager.enableButtons();
            UIManager.turnOffWarnings();
    
            FileManager.readFile().onload = (event)=>{
    
                let data = event.target.result;
                let workbook = XLSX.read(data,{type:"binary"});

                const timesMap = new Map();
                
                workbook.SheetNames.forEach(sheet => {
                    let rowObject = this.convertToJSONobj(workbook.Sheets[sheet]);
                    this.findCountByDateToMap(rowObject, timesMap);
                    let arr = this.convertMapToSortedArray(timesMap);

                    UIManager.addEL(document.getElementById("options-range-button"),
                    "click", function(){
                        let DOMheading = document.getElementById("options-range-result-content");
                        UIManager.resultString = "Range: " + MathOperations.findRange(arr);
                        UIManager.visualize(DOMheading);
                    })
        

                    UIManager.addEL(document.getElementById("options-deviation-button"),
                    "click", function(){
                        let DOMheading = document.getElementById("options-deviation-result-content");
                        UIManager.resultString = "Assymetry: ";
                        let deviation = MathOperations.findDeviation(arr);
                        UIManager.resultString += deviation > 0 ? "positive/right" 
                        : deviation == 0 ? "neutral/symmetric" : "negative/left";
                        UIManager.visualize(DOMheading);
                    });
        
                });
            }
        }
    }

    convertToJSONobj(sheet) {
        console.log(sheet);
        let rowObject = XLSX.utils.sheet_to_row_object_array(sheet);
    
        return rowObject
            .filter(function(bj){
                return bj["Event context"] == "Assignment: Качване на курсови задачи и проекти";
            })
            .filter(function(bj){
                return bj["Event name"] == "Submission created.";
            });
    }

    findCountByDateToMap(rowObject, timesMap) {
        rowObject
                    .forEach(e => {
                        let time = e["Time"].substring(0, 8);
                        if (timesMap.has(time)) {
                            let count = parseInt(timesMap.get(time));
                            timesMap.set(time, ++count);
                        } else {
                            timesMap.set(time, 1);
                        }
                });
    }

    convertMapToSortedArray(timesMap) {
        let arr = [];
        timesMap.forEach(function(value, key) {
            arr.push(parseInt(value));
        });

        return arr;
    }

}

class MathOperations {
    constructor() {
      throw Error("Class MathOperations cannot be instantiated.")
    }

    static findRange(arrayOfNumbers) {
        arrayOfNumbers = arrayOfNumbers.sort((f, s) => f - s);

        return arrayOfNumbers[arrayOfNumbers.length - 1] - arrayOfNumbers[0];
    }

    static findDeviation(arrayOfNumbers) {
        let lengt = arrayOfNumbers.length;
        let avg = arrayOfNumbers.reduce((accumulator, curr) => accumulator + curr) / lengt;

        return Math.sqrt(arrayOfNumbers.map(x => Math.pow(x - avg, 2))
            .reduce((a, b) => a + b) / lengt);
    }
}

class FileManager {
    static checkUploadedFile() {
        if (selectedFile) {
            return true;
        }
        
        return false;
    }

    static readFile() {
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(selectedFile);
        return fileReader;
    }
}

UIManager.addEL(document.getElementById('button'), "click", function() {
    const fp = new FilePrepare();
});
  
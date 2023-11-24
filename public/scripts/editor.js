// aljelmawi, mohammad - 11/23/2023
// load staff record to editor form
/* use: 
    -record:[item1,item2,...,itemn] 
    -skipIndexArray:[index1,index2,...,indexn] ... index of in -record value
    -handlers:{function1Name:[indexList,agrs]} 
        -indexList: list of [actual value] of index that was skiped in skipIndexArray
        -args: an object that will be passed to functionName like is functionName(args)
    example of use:
        loadRe...(record=['a',3,'c'],skipIndexArray=[2],handlers={ addOne: [ [2], {}] }){
            for(i in record.length.asArray){
                if (skipIndexArray.includes(i)){continue}
                input[i].value=record[i]
            }
            for hdlr in handlers:
                func = asFunction(hdlr);
                for j in hdlr[0]
                    input[j].value = func(record[j])
        }
        function addOne(value){return value+1}
*/
function loadRecordFromDataTableToEditor(record, skipIndexArray = [], handlers = {}) {
    // covert json string to an object
    record = JSON.parse(record);
    if (typeof skipIndexArray == "string"){
        skipIndexArray = JSON.parse(skipIndexArray);
    }
    if (typeof handlers == "string"){
        handlers = JSON.parse(handlers);
    }
    
    

    // change [calss='current'] to selected in  <tbody id="data_table">
    // Get all tr elements
    const rows = document.getElementById('data_table').children;
    // make sure prvious <tr class='current'> element in <tbody id="data_table"> is cleared
    // by clearing className or (class) of all <tr> elements inside <tbody id="data_table">
    for (const row of rows) {
        row.className = '';
    }
    // set <tr id=recordID> className or (class) to 'current' 
    // <tr id=recordID class=''> --> <tr id=recordID class='current'>
    const recordID = record[0];
    document.getElementById(recordID).className = 'current';

    // load values reocrd fields into editor form inputs [as ordered]
    let children = Array.from(document.forms['editor'].children);
    let inputs = children.filter(child => !(child.tagName === 'BR' || child.tagName === 'LABEL' || (child.tagName === 'INPUT' && child.type === 'submit')));
    for (let i = 0; i < inputs.length; i++) {
        // skip speical case(s)
        if (skipIndexArray.includes(i)) { continue }
        // assign value to input's value, and placeholder.
        inputs[i].value = record[i];
        inputs[i].placeholder = inputs[i].value;
    }

    // handel skiped speical case(s)
    for (let handler in handlers) {
        if (handlers.hasOwnProperty(handler)) {
            let func = window[handler];
            if (typeof func === "function") {
                for(const j of handlers[handler][0]){
                    inputs[j].value = func(record[j],handlers[handler][1]);
                    inputs[j].placeholder = inputs[j].value;
                }
            }
        }
    }
}

// --------------------- speical case handler functions ---------------------
function formatDateValue(dateValue){
    return new Date(dateValue).toISOString().substring(0, 10);
}

// --------------------- event handler functions ---------------------
function onChange(inputName) {
    // load input given input-name
    let input = document.forms['editor'][inputName];

    // input value changed
    if (input.value != input.placeholder) {
        // set input className or (class) to 'changed' : <input name=inputName class='changed'>
        input.className = 'changed';
    } else {
        // clear input className or (class) to 'changed' : <input name=inputName class=''>
        input.className = '';
    }
};

// --------------------- on this file load function ---------------------
// Function to scroll a parent element to a specific child element
function scrollToElement(parent, child) {
    parent.scrollTop = child.offsetTop - parent.offsetTop;
}
// Function to find the 'current' row and call displayStaff
function findCurrentAndDisplayRecord() {
    // Get all 'tr' elements
    const rows = document.getElementsByTagName('tr');

    for (const row of rows) {
        // Check if row has 'current' class
        if (row.classList.contains('current')) {
            // Call displayStaff with the value of the button
            row.click();

            // Scroll to row
            scrollToElement(document.getElementById('data_table'), row);

            break;
        }
    }
}
// display current sellected record [call on this script-file load]
findCurrentAndDisplayRecord();
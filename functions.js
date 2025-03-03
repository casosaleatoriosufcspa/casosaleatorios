let data = await getData("cases/hipertireoidismo")

let standard_data = await getData("standard")

let card_txt = document.getElementById("card_txt");



var info = {}



info = getInfo(info, 0, data)
orderParagraphs()

function orderParagraphs() {

    let parag_list = document.querySelectorAll(".remove").forEach(el => el.remove());

    let case_text = []

    for (let j in info) {
        case_text = getText(case_text, j, 0, info[j])
    }

    let color = true
    for (let i in case_text) {
        var paragraph = document.createElement("p");
        let list_from_case = case_text[i].split("&")
        paragraph.textContent = list_from_case[1]
        paragraph.classList.add("remove")
        if (color) {
            color = false
            paragraph.style.backgroundColor = "lightgray"
        } else {
            paragraph.style.backgroundColor = "white"
            color = true
        }
        let top = "0"
        if (Number(list_from_case[0]) == 0) {
            top = "3%"
        }
        paragraph.style.margin = top + " 0 0 " + String(Number(list_from_case[0])*2) + "%"
        paragraph.style.padding = "1%"
        card_txt.appendChild(paragraph)
    }

}

function getText(case_text, name, name_col, item) {
    if (name != "t") {

        let name1 = name_col + "&" + name
        case_text.push(name1)
        for (let i in item["children"]) {
            case_text = getText(case_text, i, item["column"], item["children"][i])
        }
            
    }
    return case_text
}


async function change_case() {
    info = getInfo(info, 0, data)
    orderParagraphs()
}

function getStandard(item, list, col) {
    for (let j in standard_data) {
        if (j.valueOf() == item.valueOf()) {
            if (typeof standard_data[j] == "object") {
                list = getInfo(list, col, standard_data[j])
            } else {
                let name = number_interval(standard_data[j])
                list[name] = {"children":{}, "column":col}
            }
        }
    }

    return list
}

function getInfo(info, column, source) {

    if (source["t"] == "b") {
        // Mais dicionarios (sources) e texto

        for (let i in source) {
            if (typeof source[i] == "object") {
                info[i] = {"children":{}, "column":column+1}
                info[i]["children"] = getInfo(info[i]["children"], column+1, source[i]) // Info é a lista final de informação, mas nesta função também é a lista enviada, que pode ser chidren de um item de info
            } else if (typeof source[i] == "string") {
                if (source[i].valueOf() == "standard".valueOf()) {
                    
                    info[i] = {"children":{}, "column":column+1}
                    
                    info[i]["children"] = getStandard(i, info[i]["children"], column+1)
                    

                    
                } else {

                    let text = String(number_interval(source[i]))

                    let child = {}
                    child[text] = {"children":{}, "column":column+2}
 
                    info[i] = {"children":child, "column":column+1}

                }
            }
        }

    } else if (source["t"] == "u") {
        // Escolher apenas um dos itens - números ou listas
        var opcoes = []
        
        for (let i in source) {

            if (typeof source[i] == "number") {

                for (let n = 0; n < source[i]; n++) {
                    let text = number_interval(i)
                    opcoes.push(text)
                }
            } else if (Array.isArray(source[i])) {
                
                if (typeof source[i][0] == "string") {
  
                    for (let n = 0; n < source[i][1]; n++) {
                        let comm = source[i][0].split(" ")
                        let children = FindItem(comm[0])
    
                        let answer = Object.keys(children)[0]
      
                        if ((comm[1].valueOf() == "=".valueOf() && Number(answer) == Number(comm[2])) || (comm[1].valueOf() == ">".valueOf() && Number(answer) > Number(comm[2])) 
                            || (comm[1].valueOf() == "<".valueOf() && Number(answer) < Number(comm[2])) || (comm[1].valueOf() == "-".valueOf() && answer.valueOf() == comm[2].valueOf())) {
             
                                opcoes.push(i)
                            
                        } 
                    }
 
            //     } else if (typeof source[i][0] == "object") {
                    
            //             let child = {}
            //             child = getInfo(child, column+2, source[i][0])
   
            //             info[i] = {"children":child, "column":column+1}
                        
                    
                }
            }
            
        }

        info[opcoes[Math.floor(Math.random() * opcoes.length)]] = {"children":{}, "column":column+1}


    } else if (source["t"] == "m") {
        // Escolher mais de um item de forma aleatória - números, listas ou strings
        for (let i in source) {
 
            if (typeof source[i] == "number") {

                if (Math.random()*100 < source[i]) {
                    info[i] = {"children":{}, "column":column+1}
                }
  
            } else if (Array.isArray(source[i])) {
                
                if (typeof source[i][0] == "string") {

                    let comm = source[i][0].split(" ")
                    let children = FindItem(comm[0])
                    
                    let answer = Object.keys(children)[0]
                    
                    if ((comm[1].valueOf() == "=".valueOf() && Number(answer) == Number(comm[2])) || (comm[1].valueOf() == ">".valueOf() && Number(answer) > Number(comm[2])) 
                        || (comm[1].valueOf() == "<".valueOf() && Number(answer) < Number(comm[2])) || (comm[1].valueOf() == "-".valueOf() && answer.valueOf() == comm[2].valueOf())) {
                        if (Math.random()*100 < source[i][1]) {
                             info[i] = {"children":{}, "column":column+1}
                        }
                    }  
                } else if (typeof source[i][0] == "object") {
                    console.log(i)
                    if (Math.random()*100 < Number(source[i][1])) {
                        let child = {}
                        child = getInfo(child, column+2, source[i][0])
   
                        info[i] = {"children":child, "column":column+1}
                        
                    }
                    
                } 
            }
            if (Object.keys(info).length == 0) {
                info = getInfo(info, column, source)
            }

            
        } 
        
       
    } 

    return info
}

function FindItem(item, list = info) {
    for (let i in list) {
   
        if (i.valueOf() == item.valueOf()) {
          
            return list[i]["children"]
        } 
        
        if (typeof list[i] == "object"& !Array.isArray(list[i])) {
      
            let children = FindItem(item, list[i])
            if (children.length != 0) {
                return children
            }          
        }
    }
    return []
}




function number_interval(original) {
    let text = ""

    if (original.includes('#')) {
        const words = original.split(" ")

        for (let w in words) {
            if (words[w].includes("#")) {
                var numb = words[w].substring(1).split("-")
                numb = numb.map(Number);
                let n = Math.floor((Math.random() * (numb[1]-numb[0])) + numb[0])
                text += n.toString() + " "
            } else {
                text += w + " "
            }
        }

    } else {
        text = original
    }
    return text
}


async function getData(text) {
    let req = './'+text+'.json'
    let response = await fetch(req);
    let userData = await response.json();
    userData = JSON.parse(JSON.stringify(userData))
    return userData;
}


document.getElementById("novo_caso").addEventListener("click", change_case) 
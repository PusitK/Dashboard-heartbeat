
Highcharts.chart('graph', {

    title: {
        text: ''
    },

    subtitle: {
        text: ''
    },

    yAxis: {
        title: {
            text: 'Number of Employees'
        }
    },

    plotOptions: {
        series: {
            pointStart: 2010
        }
    },
    credits: {
        enabled: false
    },

    series: [{
        name: 'Installation',
        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    }, {
        name: 'Manufacturing',
        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
    }]

});

let main_data = {};
let elem_body = document.getElementById('table');
let elem_card = document.querySelectorAll('.data');
let elem_progress = document.querySelectorAll('.data-storage');

let show_state = 0;
let collect_detail , collect_rom , collect_ram , collect_id;

let fetch = {
    api: function () {
        elem_body.innerHTML = '';
        $.ajax({
            crossDomain: true,
            url: "https://a0n3yz3jbj.execute-api.ap-southeast-1.amazonaws.com/prod/hb/devices",
            type: "GET",
            dataType: 'json',
            headers: {
                "Content-Type": 'application/json; charset=utf-8'
            },
            processData: false
        }).done(function (response) {
            main_data = response.data;
            create.table(function(){
                if(show_state === 1){
                    collect.data(collect_detail , collect_rom , collect_ram ,collect_id);
                    let click_elem = document.getElementById(collect_id);
                        click_elem.click();
                }
            });
        })
        
        let delay = new Date().getTime() % 60000;        
        setTimeout(fetch.api, 300000 - delay); //300000 is five minute
    }
}
let collect = {

    data : function (detail , rom ,ram , id){

        collect_id = id;
        view.detail(detail , id);
        view.memory(rom , ram);
    }
}

let view = {
    clock: function () {
        let time = moment().format('llll');
        let delay = new Date().getTime() % 60000;
        $('#clock').html(time);
        setTimeout(view.clock, 60000 - delay);
    },
    detail: function (row) {

        show_state = 1; // check state
        collect_detail = row ;
        let length = row.length;
        for(let i = 0 ; i<length ;i++){
            if(typeof row[i] === 'undefined'){
                elem_card[i].innerHTML = 'N/A';
            }else{
                elem_card[i].innerHTML = row[i];
            }
        }
        $('#display_Section').show();
        $('html, body').animate({scrollTop:$('#display_Section').offset().top-50}, 'slow');
    },
    // 1048576
    memory : function(rom , ram){

        collect_rom = rom; 
        collect_ram = ram;

        let rom_free_storage , rom_full_storage , ram_free_storage , ram_full_storage;
        let percent_rom , percent_ram;
        let cal = 1073741824;
        if(typeof rom.free_storage !== 'undefined'){rom_free_storage = (rom.free_storage / cal).toFixed(2)}
            else{ rom_free_storage = 'N/A'}
        if(typeof rom.full_storage !== 'undefined'){rom_full_storage = (rom.full_storage / cal).toFixed(2)}
            else{ rom_full_storage = 'N/A'}
        if(typeof ram.free_memory !== 'undefined'){ram_free_memory = (ram.free_memory / cal).toFixed(2)}
            else{ ram_free_memory = 'N/A'}
        if(typeof ram.full_memory !== 'undefined'){ram_full_memory = (ram.full_memory / cal).toFixed(2)}
            else{ ram_full_memory = 'N/A'}
        
        let rom_used = (rom_full_storage - rom_free_storage).toFixed(2);
        let ram_used = (ram_full_memory - ram_free_memory).toFixed(2);
        percent_rom = ((rom_used / rom_full_storage) * 100).toFixed(2);  
        percent_ram = ((ram_used / ram_full_memory) * 100).toFixed(2); 

        if(isNaN(percent_rom) || percent_rom < 0){ percent_rom = 'N/A' }
        if(isNaN(percent_ram) || percent_ram < 0){ percent_ram = 'N/A' }
        if(isNaN(rom_used) || rom_used < 0){ rom_used = 'N/A' }
        if(isNaN(ram_used) || ram_used < 0){ ram_used = 'N/A' }

        elem_progress[0].innerHTML = `
                            <i class="fa fa-hdd-o icon-card pull-right" aria-hidden="true"></i>
                            <h5 class="font"><strong>Storage</strong></h5>
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" aria-valuenow="`+ percent_rom +`"
                                aria-valuemin="0" aria-valuemax="100" style="width:`+ percent_rom +`%">
                                    <span class="progress-value">`+ percent_rom +` %</span>
                                </div>
                            </div>
                            <div>
                                <span class="text-left">`+ rom_used +` GB</span>
                                <span class="pull-right">`+ rom_full_storage +` GB</span>
                            </div>`;
        elem_progress[1].innerHTML = `
                            <i class="fa fa-floppy-o icon-card pull-right" aria-hidden="true"></i>
                            <h5 class="font"><strong>Memory</strong></h5>
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" aria-valuenow="`+ percent_ram +`"
                                aria-valuemin="0" aria-valuemax="100" style="width:`+ percent_ram +`%">
                                    <span class="progress-value">`+ percent_ram +` %</span>
                                </div>
                            </div>
                            <div>
                                <span class="text-left">`+ ram_used +` GB</span>
                                <span class="pull-right">`+ ram_full_memory +` GB</span>
                            </div>`;
    },
    toggleDiv : function(idName){
        
        let id_elem = document.getElementById(idName);
        let clpse_elem = document.querySelectorAll('.collapse');
        let clpse_elem_length = clpse_elem.length;

        for(i = 0 ; i < clpse_elem_length ; i++){
            if(clpse_elem[i].id !== idName){
                $(clpse_elem[i]).removeClass("in");
            }
        }
        if(!$( id_elem ).hasClass( "in" )){ // check for animate
            setTimeout(function(){
                $('html, body').animate({scrollTop:$(id_elem).offset().top}, 'slow');
            }, 10);
        }
    }
}
  
let create = {

    table: function (callback) {
        
        elem_body.innerHTML = ''; // clear table again for make sure

        let arr_table = [];
        for (let i in main_data) {
            if (main_data[i] !== undefined && typeof main_data[i] === 'object') {
                if (main_data[i].tags !== undefined) { // check case undefined tags
                    for (let tag in main_data[i].tags) { // loop in tags

                        let existTable = arr_table.indexOf(tag);
                        if (existTable !== -1) { //table already exist

                            create.rowTable(tag, main_data[i], main_data[i].tags[tag] , i);
                        } else {

                            let tbody = document.createElement('TBODY');
                            tbody.id = tag;
                            create.headTable(tag);
                            create.rowTable(tag, main_data[i], main_data[i].tags[tag] , i);
                            arr_table.push(tag);
                        }
                    }
                }else{
                    let existTable = arr_table.indexOf('N/A');
                    if (existTable !== -1) { //table already exist
                        create.rowTable('N/A', main_data[i], 'N/A' , i);
                    } else {

                        let tbody = document.createElement('TBODY');
                        tbody.id = 'N/A';
                        create.headTable('N/A');
                        create.rowTable('N/A', main_data[i] , 'N/A' , i);
                        arr_table.push('N/A');
                    }
                }
            }
        }
        callback();
    },
    headTable: function (tag) {

        let thead = document.createElement('THEAD');
        let tbody = document.createElement('TBODY');
            tbody.id = tag;
        thead.innerHTML = `<tr class="row-header">
                                <th>` + tag + `</th>
                                <th>Device</th>
                                <th>Battery</th>
                                <th>Storage</th>
                                <th>Memory</th>
                            </tr>`;
        elem_body.appendChild(thead);
        elem_body.appendChild(tbody)
    },
    rowTable: function (tag, data , name ,id ) {
        
        let tbody = document.getElementById(tag);
        let tr = document.createElement('TR');
            tr.id = id;
            tr.setAttribute("data-toggle", "tooltip");
            tr.setAttribute("title", "Click to show more detail");
            tr.setAttribute("data-placement", "right");
            tr.addEventListener("click", function(){
                collect.data([name, data.application.status, data.app_version, data.application.status, data.battery.percent, data.battery.health, data.battery.temperature, data.application.page_display],data.rom, data.ram , id)}); 

            tr.innerHTML +=
                `<td>` + name + `</td>
                    <td><div class="circle ` + create.color(data.application.status_color) + `"></div></td>
                    <td><div class="circle ` + create.color(data.battery.status_color) + `"></div></td>
                    <td><div class="circle ` + create.color(data.rom.status_color) + `"></div></td>
                    <td><div class="circle ` + create.color(data.ram.status_color) + `"></div></td>`;

        tbody.appendChild(tr);
        $('[data-toggle="tooltip"]').tooltip();
    },

    color: function (type) {

        if (type === 'GREEN') {
            return 'circle-online';
        } else if (type === 'YELLOW') {
            return 'circle-warning';
        } else if (type === 'RED') {
            return 'circle-offline';
        } else {
            return 'circle-unknown';
        }
    }
}


fetch.api();
view.clock();
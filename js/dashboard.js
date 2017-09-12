    // Create the chart
    Highcharts.setOptions({
        lang: {
            rangeSelectorZoom: 'Frequency : '
        },
        chart: {
            style: {
                fontFamily: 'Raleway'
            }
        },
        global: {
            useUTC: false
        }
    });
    Highcharts.Series.prototype.directTouch = true;


    let main_data = {};
    let elem_body = document.getElementById('table');
    let elem_card = document.querySelectorAll('.data');
    let elem_progress = document.querySelectorAll('.data-storage');

    let clpse_elem = document.querySelectorAll('.collapse');
    let clpse_elem_active = document.querySelectorAll('.card-panel');
    let clpse_elem_icon = document.querySelectorAll('.card-showmore-btn');

    let period_elem = document.querySelectorAll('.period');

    let show_state = 0;
    let collect_detail, collect_rom, collect_ram, collect_id;

    sessionStorage.currentGraphDisplay = 'all';

    let frequency_index = {
        '5min': 300000,
        '15min': 900000,
        '1hr': 3600 * 1000,
        '1day': 24 * 3600 * 1000
    }

    let business = '';
    //  get local storage
    if (typeof localStorage.business === 'undefined') {
        window.location = "http://survey-report.dev.triple3.io";
    } else {
        business = '?business=' + localStorage.business;
    }

    let fetch = {
        api: function () {
            let time = moment().format('llll');
            $('#clock').html('Last Update : ' + time);
            elem_body.innerHTML = '';
            $.ajax({
                crossDomain: true,
                url: "https://a0n3yz3jbj.execute-api.ap-southeast-1.amazonaws.com/prod/hb/devices" + business,
                type: "GET",
                dataType: 'json',
                headers: {
                    "Content-Type": 'application/json; charset=utf-8'
                },
                processData: false
            }).done(function (response) {
                main_data = response.data;
                create.table(function () {
                    if (show_state === 1) {
                        collect.data(collect_detail, collect_rom, collect_ram, collect_id);
                        let click_elem = document.getElementById(collect_id);
                        click_elem.click();
                    }
                });
            })

            let delay = new Date().getTime() % 60000;
            setTimeout(fetch.api, 300000 - delay); //300000 is five minute
        },
        graph(obj) {
      
            const id = Object.prototype.hasOwnProperty.call(obj, 'id') ? obj.id : collect_id;
            const type = Object.prototype.hasOwnProperty.call(obj, 'type') ? obj.type : 'all';
            let range = Object.prototype.hasOwnProperty.call(obj, 'range') ? obj.range : '1day';
            let freq = Object.prototype.hasOwnProperty.call(obj, 'freq') ? obj.freq : '1day';

            if (range === null) range = '1day';
            if (freq === null) freq = '1day';

            const enddate = moment().unix() * 1000;
            const startdate = get.dateRange(range);

            $.ajax({
                crossDomain: true,
                url: `https://a0n3yz3jbj.execute-api.ap-southeast-1.amazonaws.com/prod/hb/graph?client_device=` +
                    id + `&startdate=` + startdate + `&enddate=` + enddate,
                type: "GET",
                dataType: 'json',
                headers: {
                    "Content-Type": 'application/json; charset=utf-8'
                },
                processData: false
            }).done(function (response) {

                create.graphHub({
                    data: response.data,
                    type: type,
                    freq : frequency_index[freq]
                });
            })
        }
    }

    let get = {

        dateRange(range) {
            //current time
            let time = moment().unix();

            let rangeIndex = {
                '1hr': (time - 3600),
                '3hr': (time - (3600 * 3)),
                '6hr': (time - (3600 * 6)),
                '12hr': (time - (3600 * 12)),
                '1day': moment().startOf('day').unix(),
                '1week': moment().startOf('day').subtract(6, 'days').unix(),
                '2week': moment().startOf('day').subtract(13, 'days').unix(),
                '1month': moment().startOf('month').unix(),
                '2month': moment().subtract(2, 'month').startOf('month').unix(),
            };
            return rangeIndex[range] * 1000;
        }
    }

    let collect = {

        //collect when click row in table
        data: function (detail, rom, ram, id = {} , last_modify) { // id of element is device id too
            collect_id = id;
            view.detail(detail, id);
            view.memory(rom, ram);
            document.getElementById('lastModify').innerHTML = last_modify;
            collect.currentGraphDisplay();
        },
        
        currentGraphDisplay(chart_name , select_state){
            
            let elem_dulation , elem_freq;
            let chart = chart_name ? chart_name : sessionStorage.currentGraphDisplay;
           
            if(chart === sessionStorage.currentGraphDisplay && select_state !== 1){
                sessionStorage.currentGraphDisplay = 'all';
                elem_freq = null;
                elem_dulation = null;
            }else {
                sessionStorage.currentGraphDisplay = chart;
                elem_freq = document.querySelector('#'+chart+'Freq').value; //get freq of id
                elem_dulation = document.querySelector('#'+chart+'Dulation').value; //get freq of dulation
            }

            fetch.graph({
                type : sessionStorage.currentGraphDisplay ,
                range : elem_dulation , 
                freq : elem_freq
            });

          
        }
    }

    let view = {

        detail: function (row) {

            show_state = 1; // check state
            collect_detail = row;
            let length = row.length;
            for (let i = 0; i < length; i++) {
                if (typeof row[i] === 'undefined') {
                    elem_card[i].innerHTML = 'N/A';
                } else {
                    elem_card[i].innerHTML = row[i];
                }
            }
            $('#display_Section').show();
            $('html, body').animate({
                scrollTop: $('#display_Section').offset().top - 50
            }, 'slow');
        },
        // 1048576
        memory: function (rom, ram) {

            collect_rom = rom;
            collect_ram = ram;

            let rom_free_storage, rom_full_storage, ram_free_memory, ram_full_memory;
            let percent_rom, percent_ram;
            let rom_used, ram_used;
            let cal = 1073741824;
            if (typeof rom.free_storage !== 'undefined') {
                rom_free_storage = (rom.free_storage / cal).toFixed(2)
            } else {
                rom_free_storage = 'N/A'
            }
            if (typeof rom.full_storage !== 'undefined') {
                rom_full_storage = (rom.full_storage / cal).toFixed(2)
            } else {
                rom_full_storage = 'N/A'
            }
            if (typeof ram.free_memory !== 'undefined') {
                ram_free_memory = (ram.free_memory / cal).toFixed(2)
            } else {
                ram_free_memory = 'N/A'
            }
            if (typeof ram.full_memory !== 'undefined') {
                ram_full_memory = (ram.full_memory / cal).toFixed(2)
            } else {
                ram_full_memory = 'N/A'
            }

            rom_used = (rom_full_storage - rom_free_storage).toFixed(2);
            ram_used = (ram_full_memory - ram_free_memory).toFixed(2);
            percent_rom = ((rom_used / rom_full_storage) * 100).toFixed(2);
            percent_ram = ((ram_used / ram_full_memory) * 100).toFixed(2);

            if (isNaN(percent_rom) || percent_rom < 0) percent_rom = 'N/A'
            if (isNaN(percent_ram) || percent_ram < 0) percent_ram = 'N/A'
            if (isNaN(rom_used) || rom_used < 0) rom_used = 'N/A'
            if (isNaN(ram_used) || ram_used < 0) ram_used = 'N/A'

            elem_progress[0].innerHTML = `
                            <h5 class="font"><strong>Storage</strong></h5>
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" aria-valuenow=" ${percent_rom} "
                                aria-valuemin="0" aria-valuemax="100" style="width: ${percent_rom}%">
                                    <span class="progress-value"> ${percent_rom} %</span>
                                </div>
                            </div>
                            <div>
                                <span class="text-left"> ${rom_used} GB</span>
                                <span class="pull-right"> ${rom_full_storage} GB</span>
                            </div>`;
            elem_progress[1].innerHTML = `
                            <h5 class="font"><strong>Memory</strong></h5>
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" aria-valuenow=" ${percent_ram} "
                                aria-valuemin="0" aria-valuemax="100" style="width: ${percent_ram}%">
                                    <span class="progress-value"> ${percent_ram} %</span>
                                </div>
                            </div>
                            <div>
                                <span class="text-left"> ${ram_used} GB</span>
                                <span class="pull-right"> ${ram_full_memory} GB</span>
                            </div>`;
        },
        toggleDiv(idName) {
            
            //get current graph for keep in session
            collect.currentGraphDisplay(idName);

            let id_elem = document.getElementById(idName);
            let clpse_elem_length = clpse_elem.length;
            for (let i = 0; i < clpse_elem_length; i++) {

                if (clpse_elem[i].id !== idName) {
                    $(clpse_elem_icon[i]).removeClass("fa-angle-double-down");
                    $(clpse_elem[i]).removeClass("in");

                    $(clpse_elem_active[i]).removeClass("card-active");

                } else {
                    $(clpse_elem_active[i]).toggleClass("card-active");
                    $(clpse_elem_icon[i]).toggleClass("fa-angle-double-down");
                }
            }
            if (!$(id_elem).hasClass("in")) { // check for animate
                setTimeout(function () {
                    $('html, body').animate({
                        scrollTop: $(id_elem).offset().top - 110
                    }, 'slow');
                }, 0);
            }
        },
    }

    let create = {
        element(element) {
            return document.createElement(element);
        },
        table(callback) {
            // clear table again for make sure
            elem_body.innerHTML = '';

            let arr_table = [];
            for (let i in main_data) {
                if (main_data[i] !== undefined && typeof main_data[i] === 'object') {
                    // check case undefined tags
                    if (main_data[i].tags !== undefined) {

                        // loop in tags
                        for (let tag in main_data[i].tags) {

                            let existTable = arr_table.indexOf(tag);
                            //table already exist
                            if (existTable !== -1) {

                                create.rowTable(tag, main_data[i], main_data[i].tags[tag], i);
                            } else {

                                let tbody = create.element('TBODY');
                                tbody.id = tag;
                                create.headTable(tag);
                                create.rowTable(tag, main_data[i], main_data[i].tags[tag], i);
                                arr_table.push(tag);
                            }
                        }
                    } else {
                        let existTable = arr_table.indexOf('N/A');
                        //table already exist
                        if (existTable !== -1) {
                            create.rowTable('N/A', main_data[i], 'N/A', i);

                        } else {

                            let tbody = create.element('TBODY');
                            tbody.id = 'N/A';
                            create.headTable('N/A');
                            create.rowTable('N/A', main_data[i], 'N/A', i);
                            arr_table.push('N/A');
                        }
                    }
                }
            }
            callback();
        },
        headTable: function (tag) {

            let thead = create.element('THEAD');
            let tbody = create.element('TBODY');
            tbody.id = tag;
            if (tag === 'N/A') {
                thead.innerHTML = ` <tr class="row-header">
                                    <th class="status-offline"> Inactive </th><th></th><th></th><th></th><th></th><th></th>
                                    </tr>`;
            } else {
                thead.innerHTML = ` <tr class="row-header">
                                    <th class="status-online"> Active </th><th></th><th></th><th></th><th></th><th></th>
                                    </tr>`;
            }
            thead.innerHTML += `<tr class="row-header">
                                <th> ${tag} </th>
                                <th>Application</th>
                                <th>Battery</th>
                                <th>Storage</th>
                                <th>Memory</th>
                                <th>Last Update</th>
                            </tr>`;

            elem_body.appendChild(thead);
            elem_body.appendChild(tbody)
        },
        rowTable(tag, data, name, id = {}) {

            let last_modify = moment.unix(data.timestamp / 1000).format('llll');
            if (last_modify === 'Invalid date') {
                last_modify = '-';
            }
            let tbody = document.getElementById(tag);
            let tr = document.createElement('TR');
            tr.id = id;
            tr.setAttribute("data-toggle", "tooltip");
            tr.setAttribute("title", "Click to show more detail");
            tr.setAttribute("data-placement", "right");
            tr.addEventListener("click", function () {
                collect.data([name, data.application.status, data.app_version, data.application.status, data.battery.percent, data.battery.health, data.battery.temperature, data.application.page_display], data.rom, data.ram, id , last_modify)
            });

            tr.innerHTML +=
                `<td> ${name} </td>
                    <td><div class="circle ` + create.color(data.application.status_color) + `"></div></td>
                    <td><div class="circle ` + create.color(data.battery.status_color) + `"></div></td>
                    <td><div class="circle ` + create.color(data.rom.status_color) + `"></div></td>
                    <td><div class="circle ` + create.color(data.ram.status_color) + `"></div></td>
                    <td><i> ${last_modify} </i></td>`;

            tbody.appendChild(tr);
            $('[data-toggle="tooltip"]').tooltip();
        },

        color(type = {}) {

            if (type === 'GREEN') {
                return 'circle-online';
            } else if (type === 'YELLOW') {
                return 'circle-warning';
            } else if (type === 'RED') {
                return 'circle-offline';
            } else {
                return 'circle-unknown';
            }
        },
        graphHub(data = {}) {

            const type = Object.prototype.hasOwnProperty.call(data, 'type') ? data.type : 'all';
            const data_graph = Object.prototype.hasOwnProperty.call(data, 'data') ? data.data : {};
            const freq = Object.prototype.hasOwnProperty.call(data, 'freq') ? data.freq : frequency_index['1day'];

            if (type === 'all') {

                create.graphAppStatus(data_graph , freq);
                create.graphbattPercent(data_graph , freq);
                create.graphbattHealth(data_graph , freq);
                create.graphbattTemp(data_graph , freq);
                create.graphStorage(data_graph , freq);
                create.graphMemory(data_graph , freq);
                create.graphPageCurrent(data_graph , freq);

            } else if (type === 'deviceStatus') create.graphAppStatus(data_graph , freq);
            else if (type === 'battPercent') create.graphbattPercent(data_graph , freq);
            else if (type === 'battHealth') create.graphbattHealth(data_graph , freq);
            else if (type === 'battTemp') create.graphbattTemp(data_graph , freq);
            else if (type === 'storage') create.graphStorage(data_graph , freq);
            else if (type === 'memory') create.graphMemory(data_graph , freq);
            else if (type === 'pageCurrent') create.graphPageCurrent(data_graph , freq);
        },
        graphAppStatus(data_graph ,freq) {
            const data = data_graph.map((x) => {
                if (x.application.status === 'READY') {
                    return [x.timestamp, 1];
                } else if (x.application.status === 'BREAK') {
                    return [x.timestamp, 0];
                } else {
                    return [x.timestamp, -1];
                }
            });
            let application_chart = {
              
                rangeSelector: {
                    enabled: false,
                },
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: freq,
                    minTickInterval: freq,
                    
                    labels: {
                        enabled: true,
                        formatter: function () {
                            return moment.unix(this.value / 1000).format('L') + '<br/>' +
                                moment.unix(this.value / 1000).format('LT');
                        },
                        rotation: -45
                    },
                },
               
                yAxis: {
                    opposite: false,
                    min: -1,
                    max: 1,
                    tickInterval: 1,
                    showLastLabel: true, // show number1
                    labels: {
                        formatter: function () {
                            if (this.value === 1) {
                                return 'Ready'
                            } else if (this.value === 0) {
                                return 'Break'
                            } else {
                                return 'Background';
                            }
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        if (this.y === 1) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Status : Ready</b>';
                        } else if (this.y === 0) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Status : Break</b>';
                        } else {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Status : Background</b>';
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                series: [{
                    marker: {
                        enabled: true,
                        radius: 2
                    },
                    step: true,
                    data: data.sort(),
                    pointInterval: 3600 * 1000,
                    pointStart: Date.UTC(2006, 0, 01, 0, 0, 0, 0),
                }]
            };
            Highcharts.stockChart('applicationGraph', application_chart);

        },
        graphbattPercent(data_graph ,freq) {
            const battPercentData = data_graph.map((x) => [x.timestamp, x.battery.percent]);
            let battPercent_chart = {
             
                rangeSelector: {
                    enabled: false,
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: freq,
                    minTickInterval: freq,
                    labels: {
                        enabled: true,
                        formatter: function () {

                            return moment.unix(this.value / 1000).format('L') + '<br/>' +
                                moment.unix(this.value / 1000).format('LT');
                        },
                        rotation: -45
                    },

                },
                yAxis: {
                    min: 0,
                    max: 100,
                    opposite: false,
                    showLastLabel: true,
                    plotLines: [{
                        value: 50,
                        width: 1.5,
                        dashStyle: 'dash',
                        color: '#2ABB9B',
                        zIndex: 5
                    }],
                },
                credits: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                series: [{
                    marker: {
                        enabled: true,
                        radius: 2
                    },
                    name: 'Percentage',
                    data: battPercentData.sort(),
                    step: true,
                    type: 'areaspline',
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }]
            };
            Highcharts.stockChart('battPercentGraph', battPercent_chart);
        },
        graphbattHealth(data_graph ,freq) {
            const battHealthData = data_graph.map((x) => {
                if (x.battery.health === 'GOOD') {
                    return [x.timestamp, 0];
                } else if (x.battery.health === 'COLD') {
                    return [x.timestamp, -1];
                } else if (x.battery.health === 'OVER_HEAT') {
                    return [x.timestamp, 1];
                } else {
                    return [x.timestamp, null];
                }
            });

            let battHealth_chart = {
                
                rangeSelector: {
                    enabled: false,
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: freq,
                    minTickInterval: freq,
                    labels: {
                        enabled: true,
                        formatter: function () {
                            return moment.unix(this.value / 1000).format('L') + '<br/>' +
                                moment.unix(this.value / 1000).format('LT');
                        },
                        rotation : -45
                    },
                    
                },
                yAxis: {
                    opposite: false,
                    min: -1,
                    max: 1,
                    tickInterval: 1,
                    showLastLabel: true, // show number1
                    labels: {

                        formatter: function () {
                            if (this.value === 0) {
                                return 'GOOD'
                            } else if (this.value === 1) {
                                return 'Over Heat'
                            } else if (this.value === -1) {
                                return 'Cold';
                            } else {
                                return 'Dead';
                            }
                        }
                    }
                },
                tooltip : {
                    formatter: function () {
                        if (this.y === 1) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Status : Over Heat</b>';
                        } else if (this.y === 0) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Status : GOOD</b>';
                        } else if (this.y === -1) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Status : Cold</b>';
                        } else {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Status : DEAD</b>';
                        }
                    }
                },
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                series: [{
                    marker: {
                        enabled: true,
                        radius: 2
                    },
                    data: battHealthData.sort(),
                    step: true
                }]
            }
            Highcharts.stockChart('battHealthGraph', battHealth_chart);
        },
        graphbattTemp(data_graph ,freq) {

            const battTempData = data_graph.map((x) => [x.timestamp, x.battery.temperature]);

            let battTemp_chart = {
                
                rangeSelector: {
                    enabled: false,
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: freq,
                    minTickInterval: freq,
                    labels: {
                        enabled: true,
                        formatter: function () {
                            return moment.unix(this.value / 1000).format('L') + '<br/>' +
                                moment.unix(this.value / 1000).format('LT');
                        },
                        rotation : -45
                    },
                    
                },
                yAxis: {
                    min: 0,
                    showLastLabel: true,
                    opposite: false,
                    plotLines: [{
                        value: 37,
                        width: 1.5,
                        dashStyle: 'dash',
                        color: '#2ABB9B',
                        zIndex: 5
                    }],
                },
                credits: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                series: [{
                    name: 'Temperature',
                    step: true,
                    data: battTempData.sort(),
                    type: 'areaspline',
                    threshold: null,
                    marker: {
                        enabled: true,
                        radius: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }]
            }
            Highcharts.stockChart('battTempGraph', battTemp_chart);
        },
        graphStorage(data_graph ,freq) {
            const storageData = data_graph.map((x) => {
                let storage_used = (x.rom.full_storage - x.rom.free_storage);

                if (isNaN(storage_used) || storage_used < 0) {

                    return [x.timestamp, null]
                } else {
                    let value = (storage_used / 1073741824).toFixed(2);

                    return [x.timestamp, Number(value)];
                }
            });

            let storage_chart = {
            
                rangeSelector: {
                    enabled: false,
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: freq,
                    minTickInterval: freq,
                    labels: {
                        enabled: true,
                        formatter: function () {
                            return moment.unix(this.value / 1000).format('L') + '<br/>' +
                                moment.unix(this.value / 1000).format('LT');
                        },
                        rotation : -45
                    },
                },
                yAxis: {

                    min: 0,
                    showLastLabel: true,
                    opposite: false,
                    plotLines: [{
                        value: 37,
                        width: 1.5,
                        dashStyle: 'dash',
                        color: '#2ABB9B',
                        zIndex: 5
                    }],
                    labels: {
                        format: '{value} GB',
                    }
                },
                credits: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                series: [{
                    name: 'Storage Used',
                    step:true,
                    data: storageData.sort(),
                    type: 'areaspline',
                    threshold: null,
                    marker: {
                        enabled: true,
                        radius: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }]
            }
            Highcharts.stockChart('storageGraph', storage_chart);
        },
        graphMemory(data_graph ,freq) {

            const memoryData = data_graph.map((x) => {
                let memory_used = (x.ram.full_memory - x.ram.free_memory);

                if (isNaN(memory_used) || memory_used < 0) {

                    return [x.timestamp, null]
                } else {
                    let value = (memory_used / 1073741824).toFixed(2);

                    return [x.timestamp, Number(value)];
                }
            });


            let memory_chart = {
               
                rangeSelector: {
                    enabled: false,

                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: freq,
                    minTickInterval: freq,
                    labels: {
                        enabled: true,
                        formatter: function () {
                            return moment.unix(this.value / 1000).format('L') + '<br/>' +
                                moment.unix(this.value / 1000).format('LT');
                        },
                        rotation : -45
                    },
                },
                yAxis: {

                    min: 0,
                    showLastLabel: true,
                    opposite: false,
                    plotLines: [{
                        value: 37,
                        width: 1.5,
                        dashStyle: 'dash',
                        color: '#2ABB9B',
                        zIndex: 5
                    }],
                    labels: {
                        format: '{value} GB',
                    }

                },
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'Storage Used',
                    step : true,
                    data: memoryData.sort(),
                    type: 'areaspline',
                    marker: {
                        enabled: true,
                        radius: 2
                    },
                    threshold: null,
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }]
            }
            Highcharts.stockChart('memoryGraph', memory_chart);

        },
        graphPageCurrent(data_graph ,freq) {

            const pageCurrentData = data_graph.map((x) => {

                if (x.application.page_display === 'Q1') {
                    return [x.timestamp, 5];
                } else if (x.application.page_display === 'THANK_YOU') {
                    return [x.timestamp, 4];
                } else if (x.application.page_display === 'WAITING') {
                    return [x.timestamp, 3];
                } else if (x.application.page_display === 'LOGIN') {
                    return [x.timestamp, 2];
                } else if (x.application.page_display === 'BREAK') {
                    return [x.timestamp, 1];
                } else if (x.application.page_display === 'CLOSED') {
                    return [x.timestamp, 0];
                } else {
                    return [x.timestamp, null];
                }
            });
            let pageCurrent_chart = {
               
                rangeSelector: {
                    enabled: false,
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: freq,
                    minTickInterval: freq,
                    labels: {
                        enabled: true,
                        formatter: function () {
                            return moment.unix(this.value / 1000).format('L') + '<br/>' +
                                moment.unix(this.value / 1000).format('LT');
                        },
                        rotation : -45
                    },
                    type: 'datetime',
                },
                yAxis: {
                    opposite: false,
                    min: 0,
                    max: 5,
                    tickInterval: 1,
                    showLastLabel: true, // show number1
                    labels: {
                        formatter: function () {
                            if (this.value === 5) {
                                return 'Q1'
                            } else if (this.value === 4) {
                                return 'Thank You'
                            } else if (this.value === 3) {
                                return 'Waiting'
                            } else if (this.value === 2) {
                                return 'Login'
                            } else if (this.value === 1) {
                                return 'Break'
                            } else {
                                return 'Closed'
                            };
                        }
                    }
                },
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                tooltip: {
                    
                    formatter: function () {
                        if (this.y === 5) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Display : Q1</b>';
                        } else if (this.y === 4) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Display : Thank You</b>';
                        } else if (this.y === 3) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Display : Waiting</b>';
                        } else if (this.y === 2) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Display : Login</b>';
                        } else if (this.y === 1) {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Display : Break</b>';
                        } else {
                            return '<p>Date : ' + moment.unix(this.x / 1000).format('llll') + '</p><br/><b>Display : Closed</b>';
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                series: [{
                    marker: {
                        enabled: true,
                        radius: 2
                    },
                    step:true,
                    data: pageCurrentData.sort(),
                    step: true
                }]
            }
            Highcharts.stockChart('pageCurrentGraph', pageCurrent_chart);
        }
    }


    function logout() {
        localStorage.clear();
        window.location = "http://survey-report.dev.triple3.io";
    }

    fetch.api();
    let delay = new Date().getTime() % 60000;
    setTimeout(function(){
        collect.currentGraphDisplay();    
    }, 300000 - delay); //300000 is five minute
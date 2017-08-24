'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var main_data = {};
var elem_body = document.getElementById('table');
var elem_card = document.querySelectorAll('.data');
var elem_progress = document.querySelectorAll('.data-storage');

var clpse_elem = document.querySelectorAll('.collapse');
var clpse_elem_active = document.querySelectorAll('.card-panel');
var clpse_elem_icon = document.querySelectorAll('.card-showmore-btn');

var period_elem = document.querySelectorAll('.period');

var show_state = 0;
var state_toggle = 0;
var collect_detail = void 0,
    collect_rom = void 0,
    collect_ram = void 0,
    collect_id = void 0;

var business = '';
//  get local storage
if (typeof localStorage.business === 'undefined') {
    window.location = "http://survey-report.dev.triple3.io";
} else {
    business = localStorage.business;
}

var fetch = {
    api: function api() {
        var time = moment().format('llll');
        $('#clock').html('Last Update : ' + time);
        elem_body.innerHTML = '';
        $.ajax({
            crossDomain: true,
            url: "https://a0n3yz3jbj.execute-api.ap-southeast-1.amazonaws.com/prod/hb/devices?business=" + business,
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
                    var click_elem = document.getElementById(collect_id);
                    click_elem.click();
                }
            });
        });

        var delay = new Date().getTime() % 60000;
        setTimeout(fetch.api, 300000 - delay); //300000 is five minute
    },
    graph: function graph(obj) {
        var id = Object.prototype.hasOwnProperty.call(obj, 'id') ? obj.id : collect_id;
        var type = Object.prototype.hasOwnProperty.call(obj, 'type') ? obj.type : 'all';
        var range = Object.prototype.hasOwnProperty.call(obj, 'value') ? obj.value : '12hr';
        var enddate = moment().unix() * 1000;
        var startdate = get.dateRange(range);

        //remove collapse
        if (type === 'all') {
            // set all select to => Day
            Array.from(period_elem).map(function (x) {
                return x.selectedIndex = 3;
            });

            var clpse_elem_length = clpse_elem.length;
            for (var i = 0; i < clpse_elem_length; i++) {
                $(clpse_elem_icon[i]).removeClass("fa-angle-double-down");
                $(clpse_elem[i]).removeClass("in");
                $(clpse_elem_active[i]).removeClass("card-active");
            }
        }

        $.ajax({
            crossDomain: true,
            url: 'https://a0n3yz3jbj.execute-api.ap-southeast-1.amazonaws.com/prod/hb/graph?client_device=' + id + '&startdate=' + startdate + '&enddate=' + enddate,
            type: "GET",
            dataType: 'json',
            headers: {
                "Content-Type": 'application/json; charset=utf-8'
            },
            processData: false
        }).done(function (response) {
            create.graphHub({
                data: response.data,
                type: type
            });
        });
    }
};

var get = {
    element: function element(_element) {
        return document.createElement(_element);
    },
    dateRange: function dateRange(range) {
        //current time
        var time = moment().unix();

        var rangeIndex = {
            '1hr': time - 3600,
            '3hr': time - 3600 * 3,
            '6hr': time - 3600 * 6,
            '12hr': time - 3600 * 12,
            '1day': moment().startOf('day').unix(),
            '1week': moment().startOf('day').subtract(6, 'days').unix(),
            '2week': moment().startOf('day').subtract(13, 'days').unix(),
            '1month': moment().startOf('month').unix(),
            '2month': moment().subtract(2, 'month').startOf('month').unix()
        };
        return rangeIndex[range] * 1000;
    }
};

var collect = {

    data: function data(detail, rom, ram) {
        var id = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        // id of element is device id too

        collect_id = id;
        view.detail(detail, id);
        view.memory(rom, ram);
        fetch.graph({
            type: 'all',
            id: id
        });
    }
};

var view = {

    detail: function detail(row) {

        show_state = 1; // check state
        collect_detail = row;
        var length = row.length;
        for (var i = 0; i < length; i++) {
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
    memory: function memory(rom, ram) {

        collect_rom = rom;
        collect_ram = ram;

        var rom_free_storage = void 0,
            rom_full_storage = void 0,
            ram_free_memory = void 0,
            ram_full_memory = void 0;
        var percent_rom = void 0,
            percent_ram = void 0;
        var rom_used = void 0,
            ram_used = void 0;
        var cal = 1073741824;
        if (typeof rom.free_storage !== 'undefined') {
            rom_free_storage = (rom.free_storage / cal).toFixed(2);
        } else {
            rom_free_storage = 'N/A';
        }
        if (typeof rom.full_storage !== 'undefined') {
            rom_full_storage = (rom.full_storage / cal).toFixed(2);
        } else {
            rom_full_storage = 'N/A';
        }
        if (typeof ram.free_memory !== 'undefined') {
            ram_free_memory = (ram.free_memory / cal).toFixed(2);
        } else {
            ram_free_memory = 'N/A';
        }
        if (typeof ram.full_memory !== 'undefined') {
            ram_full_memory = (ram.full_memory / cal).toFixed(2);
        } else {
            ram_full_memory = 'N/A';
        }

        rom_used = (rom_full_storage - rom_free_storage).toFixed(2);
        ram_used = (ram_full_memory - ram_free_memory).toFixed(2);
        percent_rom = (rom_used / rom_full_storage * 100).toFixed(2);
        percent_ram = (ram_used / ram_full_memory * 100).toFixed(2);

        if (isNaN(percent_rom) || percent_rom < 0) percent_rom = 'N/A';
        if (isNaN(percent_ram) || percent_ram < 0) percent_ram = 'N/A';
        if (isNaN(rom_used) || rom_used < 0) rom_used = 'N/A';
        if (isNaN(ram_used) || ram_used < 0) ram_used = 'N/A';

        elem_progress[0].innerHTML = '\n                            <i class="fa fa-hdd-o icon-card pull-right" aria-hidden="true"></i>\n                            <h5 class="font"><strong>Storage</strong></h5>\n                            <div class="progress">\n                                <div class="progress-bar" role="progressbar" aria-valuenow=" ' + percent_rom + ' "\n                                aria-valuemin="0" aria-valuemax="100" style="width: ' + percent_rom + '%">\n                                    <span class="progress-value"> ' + percent_rom + ' %</span>\n                                </div>\n                            </div>\n                            <div>\n                                <span class="text-left"> ' + rom_used + ' GB</span>\n                                <span class="pull-right"> ' + rom_full_storage + ' GB</span>\n                            </div>';
        elem_progress[1].innerHTML = '\n                            <i class="fa fa-floppy-o icon-card pull-right" aria-hidden="true"></i>\n                            <h5 class="font"><strong>Memory</strong></h5>\n                            <div class="progress">\n                                <div class="progress-bar" role="progressbar" aria-valuenow=" ' + percent_ram + ' "\n                                aria-valuemin="0" aria-valuemax="100" style="width: ' + percent_ram + '%">\n                                    <span class="progress-value"> ' + percent_ram + ' %</span>\n                                </div>\n                            </div>\n                            <div>\n                                <span class="text-left"> ' + ram_used + ' GB</span>\n                                <span class="pull-right"> ' + ram_full_memory + ' GB</span>\n                            </div>';
    },
    toggleDiv: function toggleDiv(idName) {

        var id_elem = document.getElementById(idName);
        var clpse_elem_length = clpse_elem.length;
        for (var i = 0; i < clpse_elem_length; i++) {

            if (clpse_elem[i].id !== idName) {
                $(clpse_elem_icon[i]).removeClass("fa-angle-double-down");
                $(clpse_elem[i]).removeClass("in");

                $(clpse_elem_active[i]).removeClass("card-active");
            } else {
                $(clpse_elem_active[i]).toggleClass("card-active");
                $(clpse_elem_icon[i]).toggleClass("fa-angle-double-down");
            }
        }
        if (!$(id_elem).hasClass("in")) {
            // check for animate
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $(id_elem).offset().top - 110
                }, 'slow');
            }, 0);
        }
    }
};

var create = {
    table: function table(callback) {
        // clear table again for make sure
        elem_body.innerHTML = '';

        var arr_table = [];
        for (var i in main_data) {
            if (main_data[i] !== undefined && _typeof(main_data[i]) === 'object') {
                // check case undefined tags
                if (main_data[i].tags !== undefined) {

                    // loop in tags
                    for (var tag in main_data[i].tags) {

                        var existTable = arr_table.indexOf(tag);
                        //table already exist
                        if (existTable !== -1) {

                            create.rowTable(tag, main_data[i], main_data[i].tags[tag], i);
                        } else {

                            var tbody = get.element('TBODY');
                            tbody.id = tag;
                            create.headTable(tag);
                            create.rowTable(tag, main_data[i], main_data[i].tags[tag], i);
                            arr_table.push(tag);
                        }
                    }
                } else {
                    var _existTable = arr_table.indexOf('N/A');
                    //table already exist
                    if (_existTable !== -1) {
                        create.rowTable('N/A', main_data[i], 'N/A', i);
                    } else {

                        var _tbody = get.element('TBODY');
                        _tbody.id = 'N/A';
                        create.headTable('N/A');
                        create.rowTable('N/A', main_data[i], 'N/A', i);
                        arr_table.push('N/A');
                    }
                }
            }
        }
        callback();
    },

    headTable: function headTable(tag) {

        var thead = get.element('THEAD');
        var tbody = get.element('TBODY');
        tbody.id = tag;
        thead.innerHTML = '<tr class="row-header">\n                                <th> ' + tag + ' </th>\n                                <th>Application</th>\n                                <th>Battery</th>\n                                <th>Storage</th>\n                                <th>Memory</th>\n                                <th>Last Update</th>\n                            </tr>';
        elem_body.appendChild(thead);
        elem_body.appendChild(tbody);
    },
    rowTable: function rowTable(tag, data, name) {
        var id = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


        var last_modify = moment.unix(data.timestamp / 1000).format('llll');
        if (last_modify === 'Invalid date') {
            last_modify = '-';
        }
        var tbody = document.getElementById(tag);
        var tr = document.createElement('TR');
        tr.id = id;
        tr.setAttribute("data-toggle", "tooltip");
        tr.setAttribute("title", "Click to show more detail");
        tr.setAttribute("data-placement", "right");
        tr.addEventListener("click", function () {
            collect.data([name, data.application.status, data.app_version, data.application.status, data.battery.percent, data.battery.health, data.battery.temperature, data.application.page_display], data.rom, data.ram, id);
        });

        tr.innerHTML += '<td> ' + name + ' </td>\n                    <td><div class="circle ' + create.color(data.application.status_color) + '"></div></td>\n                    <td><div class="circle ' + create.color(data.battery.status_color) + '"></div></td>\n                    <td><div class="circle ' + create.color(data.rom.status_color) + '"></div></td>\n                    <td><div class="circle ' + create.color(data.ram.status_color) + ('"></div></td>\n                    <td><i> ' + last_modify + ' </i></td>');

        tbody.appendChild(tr);
        $('[data-toggle="tooltip"]').tooltip();
    },
    color: function color() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


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
    graphHub: function graphHub() {
        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


        var type = Object.prototype.hasOwnProperty.call(data, 'type') ? data.type : 'all';
        var data_graph = Object.prototype.hasOwnProperty.call(data, 'data') ? data.data : {};
        if (type === 'all') {

            create.graphAppStatus(data_graph);
            create.graphbattPercent(data_graph);
            create.graphbattHealth(data_graph);
            create.graphbattTemp(data_graph);
            create.graphStorage(data_graph);
            create.graphMemory(data_graph);
            create.graphPageCurrent(data_graph);
        } else if (type === 'appStatus') create.graphAppStatus(data_graph);else if (type === 'battPercent') create.graphbattPercent(data_graph);else if (type === 'battHealth') create.graphbattHealth(data_graph);else if (type === 'battTemp') create.graphbattTemp(data_graph);else if (type === 'storage') create.graphStorage(data_graph);else if (type === 'memory') create.graphMemory(data_graph);else if (type === 'pageCurrent') create.graphPageCurrent(data_graph);
    },
    graphAppStatus: function graphAppStatus(data_graph) {

        var data = data_graph.map(function (x) {
            if (x.application.status === 'READY') {
                return [x.timestamp, 1];
            } else if (x.application.status === 'BREAK') {
                return [x.timestamp, 0];
            } else {
                return [x.timestamp, -1];
            }
        });

        Highcharts.stockChart('applicationGraph', {
            chart: {
                spacingTop: 30

            },
            rangeSelector: {
                enabled: true,
                buttonPosition: {
                    y: 0
                },
                selected: 4,
                inputEnabled: false,
                allButtonsEnabled: true,
                buttonTheme: {
                    width: 50
                },
                buttons: [{
                    type: 'minute',
                    count: 5,
                    text: '5mins'
                }, {
                    type: 'minute',
                    count: 15,
                    text: '15mins'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1hour'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1day'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
            xAxis: {
                labels: {
                    enabled: true,
                    formatter: function formatter() {

                        return moment.unix(this.value / 1000).format('L') + '<br/>' + moment.unix(this.value / 1000).format('LT');
                    }
                },
                type: 'datetime'

            },
            yAxis: {
                opposite: false,
                min: -1,
                max: 1,
                tickInterval: 1,
                showLastLabel: true, // show number1
                labels: {
                    formatter: function formatter() {
                        if (this.value === 1) {
                            return 'Ready';
                        } else if (this.value === 0) {
                            return 'Break';
                        } else {
                            return 'Background';
                        }
                    }
                }
            },
            tooltip: {
                formatter: function formatter() {
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
                data: data.sort(),
                step: true
            }]
        });
    },
    graphbattPercent: function graphbattPercent(data_graph) {

        var battPercentData = data_graph.map(function (x) {
            return [x.timestamp, x.battery.percent];
        });
        Highcharts.stockChart('battPercentGraph', {
            chart: {
                spacingTop: 30

            },
            rangeSelector: {
                enabled: true,
                buttonPosition: {
                    y: 0
                },
                selected: 4,
                inputEnabled: false,
                allButtonsEnabled: true,
                buttonTheme: {
                    width: 50
                },
                buttons: [{
                    type: 'minute',
                    count: 5,
                    text: '5mins'
                }, {
                    type: 'minute',
                    count: 15,
                    text: '15mins'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1hour'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1day'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
            xAxis: {
                labels: {
                    enabled: true,
                    formatter: function formatter() {

                        return moment.unix(this.value / 1000).format('L') + '<br/>' + moment.unix(this.value / 1000).format('LT');
                    }
                },
                type: 'datetime'

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
                }]
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Percentage',
                data: battPercentData.sort(),
                type: 'areaspline',
                threshold: null,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [[0, Highcharts.getOptions().colors[0]], [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]]
                }
            }]
        });
    },
    graphbattHealth: function graphbattHealth(data_graph) {

        var battHealthData = data_graph.map(function (x) {
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
        Highcharts.stockChart('battHealthGraph', {
            chart: {
                spacingTop: 30

            },
            rangeSelector: {
                enabled: true,
                buttonPosition: {
                    y: 0
                },
                selected: 4,
                inputEnabled: false,
                allButtonsEnabled: true,
                buttonTheme: {
                    width: 50
                },
                buttons: [{
                    type: 'minute',
                    count: 5,
                    text: '5mins'
                }, {
                    type: 'minute',
                    count: 15,
                    text: '15mins'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1hour'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1day'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
            xAxis: {
                labels: {
                    enabled: true,
                    formatter: function formatter() {
                        return moment.unix(this.value / 1000).format('L') + '<br/>' + moment.unix(this.value / 1000).format('LT');
                    }
                },
                type: 'datetime'
            },
            yAxis: {
                opposite: false,
                min: -1,
                max: 1,
                tickInterval: 1,
                showLastLabel: true, // show number1
                labels: {

                    formatter: function formatter() {
                        if (this.value === 0) {
                            return 'GOOD';
                        } else if (this.value === 1) {
                            return 'Over Heat';
                        } else if (this.value === -1) {
                            return 'Cold';
                        } else {
                            return 'Dead';
                        }
                    }
                }
            },
            tooltip: {
                formatter: function formatter() {
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
            credits: {
                enabled: false
            },
            series: [{
                data: battHealthData.sort(),
                step: true
            }]
        });
    },
    graphbattTemp: function graphbattTemp(data_graph) {

        var battTempData = data_graph.map(function (x) {
            return [x.timestamp, x.battery.temperature];
        });
        Highcharts.stockChart('battTempGraph', {
            chart: {
                spacingTop: 30

            },
            rangeSelector: {
                enabled: true,
                buttonPosition: {
                    y: 0
                },
                selected: 4,
                inputEnabled: false,
                allButtonsEnabled: true,
                buttonTheme: {
                    width: 50
                },
                buttons: [{
                    type: 'minute',
                    count: 5,
                    text: '5mins'
                }, {
                    type: 'minute',
                    count: 15,
                    text: '15mins'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1hour'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1day'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
            xAxis: {
                labels: {
                    enabled: true,
                    formatter: function formatter() {
                        return moment.unix(this.value / 1000).format('L') + '<br/>' + moment.unix(this.value / 1000).format('LT');
                    }
                },
                type: 'datetime'
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
                }]
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Temperature',
                data: battTempData.sort(),
                type: 'areaspline',
                threshold: null,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [[0, Highcharts.getOptions().colors[0]], [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]]
                }
            }]
        });
    },
    graphStorage: function graphStorage(data_graph) {
        var storageData = data_graph.map(function (x) {
            var storage_used = x.rom.full_storage - x.rom.free_storage;

            if (isNaN(storage_used) || storage_used < 0) {

                return [x.timestamp, null];
            } else {
                var value = (storage_used / 1073741824).toFixed(2);

                return [x.timestamp, Number(value)];
            }
        });

        Highcharts.stockChart('storageGraph', {
            chart: {
                spacingTop: 30
            },
            rangeSelector: {
                enabled: true,
                buttonPosition: {
                    y: 0
                },
                selected: 4,
                inputEnabled: false,
                allButtonsEnabled: true,
                buttonTheme: {
                    width: 50
                },
                buttons: [{
                    type: 'minute',
                    count: 5,
                    text: '5mins'
                }, {
                    type: 'minute',
                    count: 15,
                    text: '15mins'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1hour'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1day'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
            xAxis: {
                labels: {
                    enabled: true,
                    formatter: function formatter() {
                        return moment.unix(this.value / 1000).format('L') + '<br/>' + moment.unix(this.value / 1000).format('LT');
                    }
                },
                type: 'datetime'
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
                    format: '{value} GB'
                }

            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Storage Used',
                data: storageData.sort(),
                type: 'areaspline',
                threshold: null,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [[0, Highcharts.getOptions().colors[0]], [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]]
                }
            }]
        });
    },
    graphMemory: function graphMemory(data_graph) {

        var memoryData = data_graph.map(function (x) {
            var memory_used = x.ram.full_memory - x.ram.free_memory;

            if (isNaN(memory_used) || memory_used < 0) {

                return [x.timestamp, null];
            } else {
                var value = (memory_used / 1073741824).toFixed(2);

                return [x.timestamp, Number(value)];
            }
        });
        Highcharts.stockChart('memoryGraph', {
            chart: {
                spacingTop: 30
            },
            rangeSelector: {
                enabled: true,
                buttonPosition: {
                    y: 0
                },
                selected: 4,
                inputEnabled: false,
                allButtonsEnabled: true,
                buttonTheme: {
                    width: 50
                },
                buttons: [{
                    type: 'minute',
                    count: 5,
                    text: '5mins'
                }, {
                    type: 'minute',
                    count: 15,
                    text: '15mins'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1hour'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1day'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
            xAxis: {
                labels: {
                    enabled: true,
                    formatter: function formatter() {
                        return moment.unix(this.value / 1000).format('L') + '<br/>' + moment.unix(this.value / 1000).format('LT');
                    }
                },
                type: 'datetime'
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
                    format: '{value} GB'
                }

            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Storage Used',
                data: memoryData.sort(),
                type: 'areaspline',
                threshold: null,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [[0, Highcharts.getOptions().colors[0]], [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]]
                }
            }]
        });
    },
    graphPageCurrent: function graphPageCurrent(data_graph) {

        var pageCurrentData = data_graph.map(function (x) {

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
        Highcharts.stockChart('pageCurrentGraph', {
            chart: {
                spacingTop: 30

            },
            rangeSelector: {
                enabled: true,
                buttonPosition: {
                    y: 0
                },
                selected: 4,
                inputEnabled: false,
                allButtonsEnabled: true,
                buttonTheme: {
                    width: 50
                },
                buttons: [{
                    type: 'minute',
                    count: 5,
                    text: '5mins'
                }, {
                    type: 'minute',
                    count: 15,
                    text: '15mins'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1hour'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1day'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
            xAxis: {
                labels: {
                    enabled: true,
                    formatter: function formatter() {
                        return moment.unix(this.value / 1000).format('L') + '<br/>' + moment.unix(this.value / 1000).format('LT');
                    }
                },
                type: 'datetime'
            },
            yAxis: {
                opposite: false,
                min: 0,
                max: 5,
                tickInterval: 1,
                showLastLabel: true, // show number1
                labels: {
                    formatter: function formatter() {
                        if (this.value === 5) {
                            return 'Q1';
                        } else if (this.value === 4) {
                            return 'Thank You';
                        } else if (this.value === 3) {
                            return 'Waiting';
                        } else if (this.value === 2) {
                            return 'Login';
                        } else if (this.value === 1) {
                            return 'Break';
                        } else {
                            return 'Closed';
                        };
                    }
                }
            },
            tooltip: {
                formatter: function formatter() {
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
                data: pageCurrentData.sort(),
                step: true
            }]
        });
    }
};

function logout() {
    localStorage.clear();
    window.location = "http://survey-report.dev.triple3.io";
}
fetch.api();

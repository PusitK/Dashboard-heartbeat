'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var main_data = {};
var elem_body = document.getElementById('table');
var elem_card = document.querySelectorAll('.data');
var elem_progress = document.querySelectorAll('.data-storage');

var clpse_elem = document.querySelectorAll('.collapse');
var clpse_elem_icon = document.querySelectorAll('.card-showmore-btn');

var show_state = 0;
var collect_detail = void 0,
    collect_rom = void 0,
    collect_ram = void 0,
    collect_id = void 0;

var fetch = {
    api: function api() {
        var time = moment().format('llll');
        $('#clock').html('Last Update : ' + time);
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
    }
};
var collect = {

    data: function data(detail, rom, ram, id) {

        collect_id = id;
        view.detail(detail, id);
        view.memory(rom, ram);
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
        $('html, body').animate({ scrollTop: $('#display_Section').offset().top - 50 }, 'slow');
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

        var rom_used = (rom_full_storage - rom_free_storage).toFixed(2);
        var ram_used = (ram_full_memory - ram_free_memory).toFixed(2);
        percent_rom = (rom_used / rom_full_storage * 100).toFixed(2);
        percent_ram = (ram_used / ram_full_memory * 100).toFixed(2);

        if (isNaN(percent_rom) || percent_rom < 0) {
            percent_rom = 'N/A';
        }
        if (isNaN(percent_ram) || percent_ram < 0) {
            percent_ram = 'N/A';
        }
        if (isNaN(rom_used) || rom_used < 0) {
            rom_used = 'N/A';
        }
        if (isNaN(ram_used) || ram_used < 0) {
            ram_used = 'N/A';
        }

        elem_progress[0].innerHTML = '\n                            <i class="fa fa-hdd-o icon-card pull-right" aria-hidden="true"></i>\n                            <h5 class="font"><strong>Storage</strong></h5>\n                            <div class="progress">\n                                <div class="progress-bar" role="progressbar" aria-valuenow="' + percent_rom + '"\n                                aria-valuemin="0" aria-valuemax="100" style="width:' + percent_rom + '%">\n                                    <span class="progress-value">' + percent_rom + ' %</span>\n                                </div>\n                            </div>\n                            <div>\n                                <span class="text-left">' + rom_used + ' GB</span>\n                                <span class="pull-right">' + rom_full_storage + ' GB</span>\n                            </div>';
        elem_progress[1].innerHTML = '\n                            <i class="fa fa-floppy-o icon-card pull-right" aria-hidden="true"></i>\n                            <h5 class="font"><strong>Memory</strong></h5>\n                            <div class="progress">\n                                <div class="progress-bar" role="progressbar" aria-valuenow="' + percent_ram + '"\n                                aria-valuemin="0" aria-valuemax="100" style="width:' + percent_ram + '%">\n                                    <span class="progress-value">' + percent_ram + ' %</span>\n                                </div>\n                            </div>\n                            <div>\n                                <span class="text-left">' + ram_used + ' GB</span>\n                                <span class="pull-right">' + ram_full_memory + ' GB</span>\n                            </div>';
    },

    toggleDiv: function toggleDiv(idName) {

        var id_elem = document.getElementById(idName);
        var clpse_elem_length = clpse_elem.length;

        for (var i = 0; i < clpse_elem_length; i++) {
            if (clpse_elem[i].id !== idName) {
                $(clpse_elem_icon[i]).removeClass("fa-angle-double-down");
                $(clpse_elem[i]).removeClass("in");
            } else {
                $(clpse_elem_icon[i]).addClass("fa-angle-double-down");
            }
        }
        if (!$(id_elem).hasClass("in")) {
            // check for animate
            setTimeout(function () {
                $('html, body').animate({ scrollTop: $(id_elem).offset().top }, 'slow');
            }, 10);
        }
    }
};

var create = {

    table: function table(callback) {

        elem_body.innerHTML = ''; // clear table again for make sure

        var arr_table = [];
        for (var i in main_data) {
            if (main_data[i] !== undefined && _typeof(main_data[i]) === 'object') {
                if (main_data[i].tags !== undefined) {
                    // check case undefined tags
                    for (var tag in main_data[i].tags) {
                        // loop in tags

                        var existTable = arr_table.indexOf(tag);
                        if (existTable !== -1) {
                            //table already exist

                            create.rowTable(tag, main_data[i], main_data[i].tags[tag], i);
                        } else {

                            var tbody = document.createElement('TBODY');
                            tbody.id = tag;
                            create.headTable(tag);
                            create.rowTable(tag, main_data[i], main_data[i].tags[tag], i);
                            arr_table.push(tag);
                        }
                    }
                } else {
                    var _existTable = arr_table.indexOf('N/A');
                    if (_existTable !== -1) {
                        //table already exist
                        create.rowTable('N/A', main_data[i], 'N/A', i);
                    } else {

                        var _tbody = document.createElement('TBODY');
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

        var thead = document.createElement('THEAD');
        var tbody = document.createElement('TBODY');
        tbody.id = tag;
        thead.innerHTML = '<tr class="row-header">\n                                <th>' + tag + '</th>\n                                <th>Device</th>\n                                <th>Battery</th>\n                                <th>Storage</th>\n                                <th>Memory</th>\n                            </tr>';
        elem_body.appendChild(thead);
        elem_body.appendChild(tbody);
    },
    rowTable: function rowTable(tag, data, name, id) {

        var tbody = document.getElementById(tag);
        var tr = document.createElement('TR');
        tr.id = id;
        tr.setAttribute("data-toggle", "tooltip");
        tr.setAttribute("title", "Click to show more detail");
        tr.setAttribute("data-placement", "right");
        tr.addEventListener("click", function () {
            collect.data([name, data.application.status, data.app_version, data.application.status, data.battery.percent, data.battery.health, data.battery.temperature, data.application.page_display], data.rom, data.ram, id);
        });

        tr.innerHTML += '<td>' + name + '</td>\n                    <td><div class="circle ' + create.color(data.application.status_color) + '"></div></td>\n                    <td><div class="circle ' + create.color(data.battery.status_color) + '"></div></td>\n                    <td><div class="circle ' + create.color(data.rom.status_color) + '"></div></td>\n                    <td><div class="circle ' + create.color(data.ram.status_color) + '"></div></td>';

        tbody.appendChild(tr);
        $('[data-toggle="tooltip"]').tooltip();
    },

    color: function color(type) {

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
};

fetch.api();

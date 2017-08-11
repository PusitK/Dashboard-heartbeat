$('[data-toggle="tooltip"]').tooltip();
$('#display_Section').hide();
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
let fetch = {
    api: function () {
        $.ajax({
            crossDomain: true,
            url: "https://a0n3yz3jbj.execute-api.ap-southeast-1.amazonaws.com/prod/hb/devices",
            type: "GET",
            dataType: 'json',
            headers: {
                "Content-Type": 'application/json; charset=utf-8'
            },
            processData: false
        }).done(function (response){
            main_data = response.data;
            model.branch();
        })
    }
}

let model = {
    branch : function(){
        let branch = {};
        for(let i in main_data){
            if(main_data[i] !== undefined && typeof main_data[i] === 'object'){
                if(main_data[i].tags !== undefined){
                    for(tag in main_data[i].tags){
                        if(branch[tag] === undefined){
                            branch[tag] = [{name : main_data[i].tags[tag] , data : main_data[i],id : i}];

                        }else{
                            branch[tag].push({name : main_data[i].tags[tag] , data : main_data[i],id : i});
                        }
                    }
                }else{
                    if(branch['n/a'] === undefined){
                        branch['n/a'] = [{name : 'n/a' , data : main_data[i],id : i}];
                    }else{
                        branch['n/a'].push({name : 'n/a' , data : main_data[i],id : i});
                    }
                }
            }
        }
        create.table(model.sortObject(branch));
    },
    sortObject : function(o) {
        return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    }
}
let view = {
    clock : function(){
        let time = moment().format('llll');
        let delay = new Date().getTime()%60000;
        $('#clock').html(time);
        setTimeout(view.clock,60000-delay);
    },
    detail : function(index , j ){
        console.log(index);
        console.log(j);
    }       
}  
                    

let create = {
    table : function(branch){
        console.log(branch);
        let elem_body = document.getElementById('table');
        
        for(let i in branch){

            let thead = document.createElement('THEAD');
            let tbody = document.createElement('TBODY');
                tbody.id = i; 

                thead.innerHTML = `<tr class="row-header">
                                        <th>`+ i +`</th>
                                        <th>Device Status</th>
                                        <th>Battery Percent</th>
                                        <th>Battery Temperature</th>
                                        <th>Storage</th>
                                        <th>Memory</th>
                                    </tr>`;
            elem_body.appendChild(thead);
                                        
            for(let j = 0; j < branch[i].length ; j++){
                    let tr = document.createElement('TR');

                        tr.setAttribute("data-toggle", "tooltip");
                        tr.setAttribute("title", "Click to show more detail");
                        tr.setAttribute("data-placement", "right");
                        $('[data-toggle="tooltip"]').tooltip();
                        tr.addEventListener("click", function(){view.detail(i , branch[i][j].id)}); 
                        
                        tr.innerHTML =
                        `<tr><td>` + branch[i][j].name + `</td>
                        <td><div class="circle `+ create.color(branch[i][j].data.application.status_color) +`"></div></td>
                        <td><div class="circle `+ create.color(branch[i][j].data.battery.status_color) +`"></div></td>
                        <td><div class="circle `+ create.color(branch[i][j].data.battery.health) +`"></div></td>
                        <td><div class="circle `+ create.color( branch[i][j].data.rom.status_color ) +`"></div></td>
                        <td><div class="circle `+ create.color( branch[i][j].data.ram.status_color ) +`"></div></td></tr>`;
                            
                    
                tbody.appendChild(tr);
            }
            elem_body.appendChild(tbody);
        }
    },
    color : function(type){
        
        if(type === 'GREEN' || type === 'GOOD'){
            return 'circle-online';
        }else if(type === 'YELLOW'){
            return 'circle-warning';
        }else if(type === 'RED'){
            return 'circle-offline';
        }else{
            return 'circle-unknown';
        }
    }


}

fetch.api();
view.clock();
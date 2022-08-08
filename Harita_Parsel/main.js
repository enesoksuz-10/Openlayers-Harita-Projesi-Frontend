//Harita üzerine çizilmiş olan çizgilerin kayıttan sonra kalmasını sağlar!
var styles = {
    'Point': [new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                color: [255, 255, 255, 0.3]
            }),
            stroke: new ol.style.Stroke({color: '#cb1d1d', width: 2})
        })
    })],
    'LineString': [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 1
        })
    })],
    'Polygon': [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        })
    })],
    'Circle': [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 2
            
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.2)'
        })
    })]
};
var styleFunction = function(feature, resolution) {
  return styles[feature.getGeometry().getType()];
};

const raster = new ol.layer.Tile({
    source: new ol.source.OSM(),
});



var features = new ol.Collection(); 
var kaynak = new ol.source.Vector({features: features});
var drawtype = "Point";

const vector = new ol.layer.Vector({
    source: kaynak,
	style: styleFunction
});

let draw, snap;
const modify = new ol.interaction.Modify({ source: kaynak });

//Map
var map = new ol.Map({
    target: 'map',
    layers: [raster, vector],
    view: new ol.View({
        center: ol.proj.fromLonLat([39.5266912715, 39.613190261]), //Türkiye için.
        zoom: 6
    })
});
var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var btnSave=document.getElementById("btnKaydet");
var cikis=document.getElementById("mcikic");
var secilen;
var kayitlar=[];
kayitlar["type"]="FeatureCollection";
kayitlar["features"]=[];
var bilgiler=[];

function addInteractions(drawtype) {
    map.getInteractions().pop();
    draw = new ol.interaction.Draw({
        source: kaynak,
        type: drawtype,
    });
	
    draw.on('drawend', function (evt) {
		var writer = new ol.format.GeoJSON();
		evt.feature.setId("Set"+kayitlar["features"].length);
		secilen =writer.writeFeaturesObject([evt.feature]);
		$('#myModal').modal('show');
    });	
	
    map.addInteraction(draw);
}



function DrawTypeSelect(sel) {
    drawtype = sel.value;
    if (drawtype != "")
        addInteractions(drawtype);

}
addInteractions(drawtype);


// Butona tıklandığı zaman modal göster.
btn.onclick = function (event) {
		$('#myModal').modal('show');
}

//Tıkladığım zaman modal kapat ve harita üzerindeki işaretleri sil.
mcikis.onclick = function (event){
            var a = kaynak.getFeatures();
            var b = a[a.length - 1];
            kaynak.removeFeature(b);
}

btnSave.onclick = function (event) {
	var sehir=document.getElementById("sehir");
	var ilce=document.getElementById("ilce");
	var mahalle=document.getElementById("mahalle");
		console.log(secilen);
	var json=secilen;
	var html="";
		var bilgi={
			sehir:sehir.value,
			ilce:ilce.value,
			mahalle:mahalle.value
		};
	
		var c=json.features[0];

		bilgiler.push(bilgi);
		c.properties={name:sehir.value,description:sehir.value+" - "+ilce.value+" - "+mahalle.value};
		html+="<tr>";
		html+="<td>"+sehir.value+"</td>";
		html+="<td>"+ilce.value+"</td>";
		html+="<td>"+mahalle.value+"</td>";
		html+="<td>"+c.geometry.type+"</td>";
		html+="<td><button class='btn btn-sm btn-danger btnRotaSil' data-index='"+kayitlar["features"].length+"'>Sil</button></td>"
		html+="</tr>";

        
	
	$("#tblCizimler tbody").append(html);
	kayitlar["features"].push(json);
		var feature = new ol.Feature(
            new ol.geom.Point(json)
        );	
	kaynak.addFeature(feature);
	sehir.value="";
	ilce.value="";
	mahalle.value="";
	$('#myModal').modal('hide');
	console.log(kaynak);
}

$("body").on("click",".btnRotaSil",function(){
	var index=$(this).data("index");
	var temp=[];
	var tempbilgi=[];
	
	var silinen=kayitlar["features"][index];
	for(i=0;i<kayitlar["features"].length;i++){
		if (index!=i){
			temp.push(kayitlar["features"][i]);
			tempbilgi.push(bilgiler[i])
		}
	}
	

	kayitlar["features"]=temp;
	bilgiler=tempbilgi;
	$(this).parents("tr").remove();

		const featureExists = kaynak.getFeatureById("Set"+index);
		if (featureExists) {
		  kaynak.removeFeature(featureExists);
		  return;
		}	
});



import folium
import geopandas as gpd
from branca.colormap import linear


def create_no2_map(gdf):

    # Center map

    projected = gdf.to_crs(
        epsg=32644
    )

    centroid = projected.geometry.centroid

    centroid = gpd.GeoSeries(
        centroid,
        crs="EPSG:32644"
    ).to_crs(
        epsg=4326
    )

    center = [
        centroid.y.mean(),
        centroid.x.mean()
    ]


    # Prepare values

    gdf["predicted_no2"] = (
        gdf["predicted_no2"]
        .astype(float)
    )


    gdf["predicted_scaled"] = (
        gdf["predicted_no2"] * 1e5
    )


    colormap = linear.YlOrRd_09.scale(
        gdf["predicted_scaled"].min(),
        gdf["predicted_scaled"].max()
    )


    # Create map

    m = folium.Map(
        location=center,
        zoom_start=11
    )


    folium.GeoJson(
        gdf.to_json(),

        style_function=lambda feature: {
            "fillColor": colormap(
                feature["properties"]["predicted_scaled"]
            ),
            "color": "black",
            "weight": 0.3,
            "fillOpacity": 0.7,
        },

        tooltip=folium.GeoJsonTooltip(
            fields=[
                "grid_id",
                "predicted_no2"
            ],

            aliases=[
                "Grid ID:",
                "Predicted NO₂:"
            ]
        )

    ).add_to(m)


    colormap.caption = (
        "Predicted NO₂ ×10⁻⁵"
    )

    colormap.add_to(m)


    return m
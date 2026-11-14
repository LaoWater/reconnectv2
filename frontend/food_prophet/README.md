# The Food Prophet (React widget)

Source of the simulator embedded on `/food-prophet/`. Django serves the built files from
`landing_page/static/ReactPage_FoodProphet/` and picks the entry files from its `asset-manifest.json`.

Rebuild after a change:

```bash
cd frontend/food_prophet
npm install
GENERATE_SOURCEMAP=false npx react-scripts build
rm -rf ../../landing_page/static/ReactPage_FoodProphet/static/js ../../landing_page/static/ReactPage_FoodProphet/static/css
cp -r build/static/js build/static/css ../../landing_page/static/ReactPage_FoodProphet/static/
cp build/asset-manifest.json ../../landing_page/static/ReactPage_FoodProphet/
```

The page CSS (`landing_page/static/css/food_prophet.css`) re-skins the widget through the
generated `.sc-*` class names. They come from the order styled components are created in,
so adding or removing a `styled(...)` call shifts them: re-check those selectors after such a change.

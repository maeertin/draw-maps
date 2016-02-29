# drawMaps

Drawable maps using svgs instead of image maps

## Example

```javascript
drawMaps('.drawMap', {
    // options
});
```

## Options

Option | Type | Default Value | Description
--- | --- | --- | ---
**wrapImages** | *bool* | true | Whether target should be wrapped
**regretKey** | *string* | "metaKey" | Extended click functionality
**closeKey** | *string* | "shiftKey" | Extended click functionality
**resetKey** | *string* | "altKey" | Extended click functionality
**fillColor** | *string* | "rgba(255, 0, 0, 0.3)" | Path fill color
**strokeColor** | *string* | "rgba(255, 0, 0, 0.5)" | Path stroke color
**strokeWidth** | *number* | 1 | Path stroke width

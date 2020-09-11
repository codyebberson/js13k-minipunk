#!/bin/bash

CLOSURE_VERSION="20200719"
CLOSURE_DIR="tools/closure-compiler"
CLOSURE_JAR="$CLOSURE_DIR/closure-compiler-v$CLOSURE_VERSION.jar"
CLOSURE_URL="https://dl.google.com/closure-compiler/compiler-$CLOSURE_VERSION.zip"

# Test if closure compiler available
if [ ! -f $CLOSURE_JAR ]; then
    # File not found

    # Ensure the ~/.closure-compiler directory exists
    mkdir -p $CLOSURE_DIR

    # Move into that director
    pushd $CLOSURE_DIR

    # Download pre-built binary
    wget $CLOSURE_URL -O compiler.zip

    # Extract just the compiler .jar file
    unzip -p compiler.zip closure-compiler-v$CLOSURE_VERSION.jar > closure-compiler-v$CLOSURE_VERSION.jar

    # Delete the .zip file
    rm compiler.zip

    # Move back to the project directory
    popd
fi

java -jar $CLOSURE_JAR \
    --language_in ECMASCRIPT_2019 \
    --language_out ECMASCRIPT_2019 \
    --compilation_level ADVANCED_OPTIMIZATIONS \
    --strict_mode_input \
    --warning_level VERBOSE \
    --summary_detail_level=3 \
    --jscomp_error="*" \
    --jscomp_off=missingRequire \
    --jscomp_off=strictMissingRequire \
    --externs "src/externs.js" \
    --js "src/music.js" \
    --js "src/soundeffects.js" \
    --js "src/sonantx.js" \
    --js "src/audio.js" \
    --js "src/shared.js" \
    --js "src/vec3.js" \
    --js "src/mat4.js" \
    --js "src/colors.js" \
    --js "src/cube.js" \
    --js "src/bufferset.js" \
    --js "src/input.js" \
    --js "src/keys.js" \
    --js "src/mouse.js" \
    --js "src/glconstants.js" \
    --js "src/screen.js" \
    --js "src/fbo.js" \
    --js "src/shader.js" \
    --js "src/geometryshader.js" \
    --js "src/bloomshader.js" \
    --js "src/tonemappingshader.js" \
    --js "src/camera.js" \
    --js "src/engine.js" \
    --js "src/overlay.js" \
    --js "src/voxelengine.js" \
    --js "src/procgen.js" \
    --js "src/particles.js" \
    --js "src/entity.js" \
    --js "src/collision.js" \
    --js "src/car.js" \
    --js "src/game.js" \
    --js "src/index.js" \
    --js_output_file "dist/out.min.js"

# Move into the dist directory
pushd dist

# Build self contained HTML file
echo "<!doctype html>" > "index.html"
echo "<html lang=\"en\">" >> "index.html"
echo "<head>" >> "index.html"
echo "<meta charset=\"utf-8\">" >> "index.html"
echo "<title>MINIPUNK</title>" >> "index.html"
echo "<style>" >> "index.html"
cat ../styles.css >> "index.html"
echo "</style>" >> "index.html"
echo "</head>" >> "index.html"
echo "<body>" >> "index.html"
echo "<canvas></canvas>" >> "index.html"
echo "<canvas></canvas>" >> "index.html"
echo "<script>" >> "index.html"
cat out.min.js >> "index.html"
echo "</script>" >> "index.html"
echo "</body>" >> "index.html"
echo "</html>" >> "index.html"

# Delete old zip files
rm *.zip

# Create the ECT zip file
ect -strip -zip -10009 -strip index.html

# Report the remaining bytes
for i in *.zip; do
    echo "$i  --  $(wc -c < $i)  --  $((13312 - $(wc -c < $i))) bytes remaining"
done

# Return to original directory
popd

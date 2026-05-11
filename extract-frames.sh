#!/bin/bash
INPUT=${1:-output/quiz_001.mp4}
NAME=$(basename "$INPUT" .mp4)
OUT="review_frames/$NAME"
mkdir -p "$OUT"

# Extract 1 frame per second
ffmpeg -i "$INPUT" -vf fps=1 "$OUT/frame_%02d.png"

# Convert all frames into a single PDF in correct sequence
convert $(ls "$OUT/frame_"*.png | sort) "$OUT/$NAME_review.pdf"

echo "Done → $OUT/$NAME_review.pdf"

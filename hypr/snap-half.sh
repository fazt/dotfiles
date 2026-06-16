#!/usr/bin/env bash
# Snap la ventana activa a la mitad de su monitor (en modo flotante).
# Uso: snap-half.sh top|bottom|left|right
side="${1:-top}"

# Geometria del monitor enfocado
read -r MX MY MODE_W MODE_H SCALE TRANSFORM < <(
  hyprctl -j monitors | jq -r '.[] | select(.focused==true) | "\(.x) \(.y) \(.width) \(.height) \(.scale) \(.transform)"'
)

# Dimensiones logicas (mode/scale), intercambiando ancho/alto si esta rotado 90/270
LW=$(awk "BEGIN{printf \"%d\", $MODE_W/$SCALE}")
LH=$(awk "BEGIN{printf \"%d\", $MODE_H/$SCALE}")
case "$TRANSFORM" in
  1|3|5|7) EW=$LH; EH=$LW ;;   # rotado: intercambia
  *)       EW=$LW; EH=$LH ;;
esac

case "$side" in
  top)    W=$EW;        H=$((EH/2)); X=$MX;          Y=$MY ;;
  bottom) W=$EW;        H=$((EH/2)); X=$MX;          Y=$((MY+EH/2)) ;;
  left)   W=$((EW/2));  H=$EH;       X=$MX;          Y=$MY ;;
  right)  W=$((EW/2));  H=$EH;       X=$((MX+EW/2)); Y=$MY ;;
  *) echo "uso: $0 top|bottom|left|right"; exit 1 ;;
esac

hyprctl --batch "dispatch hl.dsp.window.float({ action = \"enable\" }) ; dispatch hl.dsp.window.resize({ x = $W, y = $H, relative = false }) ; dispatch hl.dsp.window.move({ x = $X, y = $Y, relative = false })"

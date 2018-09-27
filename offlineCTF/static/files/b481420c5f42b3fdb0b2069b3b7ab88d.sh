#!/bin/bash
FLAG="SpaceCTF{what_a_foX_5ay?}"
FIELD_SIZE=50
FOXES=()
for FOX_NUMBER in {0..100} # Array generation
do
	X_POSITION=$(( RANDOM % $FIELD_SIZE ))
	Y_POSITION=$(( RANDOM % $FIELD_SIZE ))
    FOXES+=("FOX_$FOX_NUMBER:$X_POSITION,$Y_POSITION")
done

echo "Foxes want play with you"

USER_INPUT_REGULAR='^[0-9]+ [0-9]+$'
for LOOP_INDEX in {1..1000}; do  # Main loop
	SECONDS=0
	echo 'Give us your coordinates "x y"'
	ANSWER=nil
	read -t 2 ANSWER
	if [[ $ANSWER =~ $USER_INPUT_REGULAR ]]
	then
		USER_X_POSITION="${ANSWER%% *}"
		USER_Y_POSITION="${ANSWER##* }"
		if (( "$USER_X_POSITION" >= "$FIELD_SIZE" )) || (( "$USER_Y_POSITION" >= "$FIELD_SIZE" )); then # Numbers check
			echo "Around there is no foxes"
			exit
		fi
		X_FOX_COUNT=0
		Y_FOX_COUNT=0
		for FOX in "${FOXES[@]}"; do # Fox around check
		    KEY="${FOX%%:*}"
		    VALUE="${FOX##*:}"
			X_POSITION="${VALUE%%,*}"
			Y_POSITION="${VALUE##*,}"
			if [ "$X_POSITION" == "$USER_X_POSITION" ]; then
				#echo $FOX
				let X_FOX_COUNT=X_FOX_COUNT+1
			fi
			if [ "$Y_POSITION" == "$USER_Y_POSITION" ]; then
				#echo $FOX
				let Y_FOX_COUNT=Y_FOX_COUNT+1
			fi
			if [ "$X_POSITION" == "$USER_X_POSITION" ] && [ "$Y_POSITION" == "$USER_Y_POSITION" ]; then
				#echo "${FOXES[@]}"
				FOXES=("${FOXES[@]/$FOX}")
				#echo "${FOXES[@]}"
				if [ "$FOXES" == "" ]; then
					echo "You win!"
					echo "$FLAG"
					exit
				fi
			fi
		done
		printf "Horisontal %s, vertical %s.\n" "$X_FOX_COUNT" "$Y_FOX_COUNT"
	else
		if [ "$SECONDS" -lt "4" ]; then
			echo "Uncorrent format"
		else
			echo "Too slow, we do not want to play with you anymore"
		fi
		exit
	fi
done
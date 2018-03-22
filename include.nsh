
!macro registerFileAssociations
  WriteRegStr HKCU "Software\Classes\.imgx" "" "AzimuthFragment"
  WriteRegStr HKCU "Software\Classes\.imgf" "" "AzimuthFragment"
  WriteRegStr HKCU "Software\Classes\.imgv" "" "AzimuthFragment"
  WriteRegStr HKCU "Software\Classes\AzimuthFragment" "" "Evidence archive"
  WriteRegStr HKCU "Software\Classes\AzimuthFragment\DefaultIcon" ""  \
    "$INSTDIR\${APP_NAME}.exe"
  WriteRegStr HKCU "Software\Classes\AzimuthFragment\shell\open\command" "" \
    "$\"$INSTDIR\${APP_NAME}.exe$\" $\"%1$\""
!macroend

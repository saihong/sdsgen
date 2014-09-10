sdsgen
======
產生SDS 工具

##install 
1.安裝 nodejs
2.安裝 git
3.在 erpHome/公司別 目錄下，執行 git clone 此 .git
4.進入 sdsgen 目錄
5.將 wiki.html 放到 erpHome/公司別/html 目錄下
6.執行 npm install

##指令說明
+ skeleton %1
  - 產生sds骨架目錄，%1 為系統代號，如:
```
    skeleton pb
```
+ fromGul %1/%2
  - 從 gul 產生 sds底稿，%1 為 spec id，%2 為 gul 檔名，如:
```
fromGul PBJGR01/pbjgR01.gul
```
指令會讀取 pb/sds/spec/PBJGR01/gul/pgjgR01.gul, 產生 sds 底稿: pb/sds/spec/PBJGR01/PBJGR01.txt

+ gen %1
  - 產生文件、原始碼，%1 為系統代號，如:
```
gen pb
```
指令將pb系統的所有sds文件產生在:
```
html/pb/sds/spec/PBJGR01/PBJGR01.md
```
當然還包括相對應的java原始碼，如:
```
pb/src/com/.../pb/func/...
pb/src/com/.../pb/web/trigger/...
pb/src/com/.../pb/select/...
```


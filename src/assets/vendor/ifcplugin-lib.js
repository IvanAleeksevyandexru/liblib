(function (window) {
  /**
   * @class IFCPlugin
   * @description Объект для работы с IFC плагином. Содержит методы для доступа к криптографическим и сервисным функциям Плагина.
   * @param pluginObject Объект плагина (Устаревший параметр)
   * @param inGoogleChrome {Boolean} Признак запуска в браузере Google Chrome (Устаревший параметр)
   * @param testFunctionsEnabled {Boolean} Признак активации тестовых функций
   */
  window.IFCPlugin = function (pluginObject, inGoogleChrome, testFunctionsEnabled) {

    // if (typeof pluginObject === typeof true) {
    //     testFunctionsEnabled = pluginObject;
    // }

    // Версия библиотеки
    /**@private*/
    var libVersion = "2.2.1";

    // Префикс для GUID
    /**@private*/
    var guidPrefix = "";

    // Коннектор для общения с плагином
    /**@private*/
    var connector = null;

    // Статус библиотеки
    /**@public*/
    this.status = null;

    // Схема с помошью которой можно окрыть расширение для safari
    /**@public*/
    this.safariExtensionScheme = "safariExtension://";


    ///////////////////////////////////////////////
    // Метод для работы с событиями в библиотеке
    ///////////////////////////////////////////////

    /**@private
     * @description Метод для подписи на событие из библиотеки
     * */
    this.listenPluginEvent = function (eventName, callback) {
      if (document.addEventListener) {
        document.addEventListener(eventName, callback, false);
      } else {
        document.documentElement.attachEvent('onpropertychange', function (e) {
          if (e.propertyName === eventName) {
            callback();
          }
        });
      }
    };

    /**@private
     * @description Метод для генерации события
     * */
    function triggerPluginEvent(eventName) {
      if (document.createEvent) {
        var event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
        document.dispatchEvent(event);
      } else {
        document.documentElement[eventName]++;
      }
    }


    ///////////////////////////////////////////////
    // Коннектор для NPAPI
    ///////////////////////////////////////////////

    /**
     * @class IFCNPAPIConnector
     * @description Объект для отправки и получения сообщений плагину NPAPI Плагину IFC.
     */
    function IFCNPAPIConnector(pluginObject) {
      /**@private*/
      var pluginObject = pluginObject;

      /**
       * @description Отправляет запрос плагину.
       * */
      this.send = function (msg, callback) {
        try {
          pluginObject.post_message(JSON.stringify(msg), function (plugin, rep_msg) {
            callback(JSON.parse(rep_msg));
          });
        } catch (e) {
          callback({'error_code': IFCError.IFC_PLUGIN_UNDEFINED_ERROR});
        }
      }
    }


    ///////////////////////////////////////////////
    // Коннектор для Native Messaging
    ///////////////////////////////////////////////

    /**
     * @class IFCNativeMessagingConnector
     * @description Объект для отправки и получения сообщений Goolgle Chrome расширению IFC.
     */
    function IFCNativeMessagingConnector() {
      // Сохраняем окно, через которое будем общаться с расширением
      /**@private*/
      var WND = window;

      // Текущий пользовательский callback
      /**@private*/
      var currentUserCallback = false;

      /**@private*/
      var connected = false;

      /**@private
       * @description Отправляет запрос плагину.
       * */
      function sendToExtension(msg, callback) {
        currentUserCallback = callback;
        try {
          WND.postMessage(JSON.stringify({type: "TO_IFC_EXT", msg_data: msg}), "*");
        } catch (e) {
          currentUserCallback = false;
          callback({"error_code": IFCError.IFC_PLUGIN_UNDEFINED_ERROR});
        }
      }

      /**@private
       * @description Получает ответ от плагина и передает его пользовательскому callback'у.
       * */
      function recvFromExtension(msg) {
        if (msg.intermediate) {
          currentUserCallback(msg);
        } else {
          if (currentUserCallback) {
            var currentCallback = currentUserCallback;
            currentUserCallback = false;

            currentCallback(msg);
          }
        }
      }

      /**@private
       * @description Обработчик разрыва соединения с расширением.
       * */
      function disconnectFromExtension() {
        if (currentUserCallback) {
          var currentCallback = currentUserCallback;
          currentUserCallback = false;

          currentCallback({"error_code": IFCError.IFC_PLUGIN_UNDEFINED_ERROR});
        }
        connected = false;
      }

      /**@private
       * @description Обрабатывает сообщения от плагина.
       * */
      function IFCMessageHandler(event) {
        // Принимаем сообщения только от себя
        if (event.source !== WND)
          return;

        try {
          var event_data = JSON.parse(event.data);
          if (event_data.type && (event_data.type === "FROM_IFC_EXT")) {
            recvFromExtension(event_data.msg_data);
          } else if (event_data.type && (event_data.type === "IFC_EXT_DISCONNECT")) {
            disconnectFromExtension();
          }
        } catch (e) {
          //Пропускаем невалидные сообщения
        }
      }

      /**@private
       * @description Устанавливает соединение с плагином.
       * */
      function connectToIFC() {
        if (connected)
          return IFCError.IFC_OK;

        try {
          WND.addEventListener("message", IFCMessageHandler, false);
        } catch (e) {
          return IFCError.IFC_PLUGIN_UNDEFINED_ERROR;
        }

        connected = true;
        return IFCError.IFC_OK;
      }

      /**@private
       * @description Отправляет запрос плагину.
       * */
      this.send = function (msg, callback) {
        // Что-то пошло не так!
        // Библиотека асинхронная, но однопоточная - параллельные запросы ЗАПРЕЩЕНЫ!
        if (currentUserCallback) {
          callback({"error_code": IFCError.IFC_GENERAL_ERROR});
          return;
        }
        // Подключаемся к расширению, если этого еще не сделали
        var rc = connectToIFC();
        if (rc !== IFCError.IFC_OK) {
          callback({"error_code": rc});
          return;
        }

        // Отправляем запрос
        sendToExtension(msg, callback);
      }
    }

    // Метод для определения версии safari
    /**@private*/
    function isNewSafari() {
      var ua = navigator.userAgent;

      if ((ua.search('Safari') !== -1) && (ua.search('Version') !== -1)) {
        var pos = ua.indexOf("Version") + 8;
        var startStr = ua.substr(pos);
        if (startStr) {
          var endPos = pos + startStr.indexOf(".");
          var version = startStr ? parseInt(ua.substring(pos, endPos), 10) : 0;
          if (version >= 12) {
            return true;
          }
        }
      }
      return false;
    }

    // Метод для выбора коннектора
    /**@private*/
    function isNativeMessaging() {
      var ua = navigator.userAgent;

      var includeArr = ['Firefox', 'Chrome', 'Opera', 'Edge', 'YaBrowser', 'Safari'];

      for (var i = 0; i < includeArr.length; i++) {
        if ((ua.search(includeArr[i]) !== -1) && (includeArr[i] === 'Firefox')) {
          var fPos = ua.indexOf(includeArr[i]) + 8;
          var fStartStr = ua.substr(fPos);
          if (fStartStr) {
            var fEndPos = fPos + fStartStr.indexOf(".");
            var fVersion = fStartStr ? parseInt(ua.substring(fPos, fEndPos), 10) : 0;
            if (fVersion >= 50) {
              return true;
            }
          }
          break;
        } else if ((ua.search(includeArr[i]) !== -1) && (includeArr[i] === 'Safari') && (ua.search('Version') !== -1)) {
          var sPos = ua.indexOf("Version") + 8;
          var sStartStr = ua.substr(sPos);
          if (sStartStr) {
            var sEndPos = sPos + sStartStr.indexOf(".");
            var sVersion = sStartStr ? parseInt(ua.substring(sPos, sEndPos), 10) : 0;
            if (sVersion >= 12) {
              return true;
            }
          }
          break;
        }
        if (ua.search(includeArr[i]) !== -1) {
          return true;
        }
      }
      return false;
    }

    // Создает соединение с плагином
    if (isNativeMessaging())
      connector = new IFCNativeMessagingConnector();
    else
      connector = new IFCNPAPIConnector(pluginObject);


    ///////////////////////////////////////////////
    // Приватные методы и параметры библиотеки
    ///////////////////////////////////////////////

    /**@private
     * @description Возвращает перечень СКЗИ заданного типа, доступных для плагина, в виде массива объектов IFCCrypto.
     * */
    function getCryptoListByType(cryptoType, callback) {
      connector.send({func_name: "get_list_info", params: {"cryptoType": cryptoType}}, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var ifc_list = [];
        for (var i = 0; i < msg.ifc_list.length; i++) {
          if (msg.ifc_list[i]['type'] === cryptoType || cryptoType == null) {
            ifc_list.push(new IFCCrypto(msg.ifc_list[i]));
          }
        }
        callback({"error_code": IFCError.IFC_OK, "ifc_list": ifc_list});
      });
    }

    /**@private
     * @description Возвращает перечень СКЗИ, доступных для плагина, в виде массива объектов IFCCrypto.
     * */
    function getCryptoList(callback) {
      return getCryptoListByType(null, callback);
    }

    /**@private
     * @description Возвращает информацию о СКЗИ (объект IFCCrypto), по переданному на вход cryptoId.
     * */
    function getCryptoById(cryptoId, callback) {
      getCryptoList(function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        for (var i = 0; i < msg.ifc_list.length; i++) {
          if (cryptoId === msg.ifc_list[i].getCryptoId()) {
            callback({"error_code": IFCError.IFC_OK, "crypto": msg.ifc_list[i]});
            return;
          }
        }
        callback({"error_code": IFCError.IFC_CRYPTO_NOT_FOUND, "crypto": crypto});
      });
    }

    /**@private
     * @description Получение идентификатора криптоустройства по ContainerId.
     * */
    function getCryptoIdByContainerId(containerId) {
      if (!containerId)
        return "";
      var cryptoProvlist = ["CryptoPro", "VIPNet", "SignalCom", "LISSI-CSP"];

      for (var i = 0; i < cryptoProvlist.length; i++) {
        if (containerId.indexOf(cryptoProvlist[i]) >= 0) return containerId.substring(0, containerId.indexOf("/"));
      }

      return containerId.substring(0, containerId.lastIndexOf("/"));
    }

    /**@private*/
    function sign(containerId, userPin, data, ifcDataType, ifcSignType, callback, cspUI) {
      getCryptoById(getCryptoIdByContainerId(containerId), function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        if (typeof cspUI === "undefined") {
          cspUI = IFCConst.IFC_SHOW_CSP_UI;
        }

        //hashType больше не используется в плагине начиная с версии 3.1.0, оставлен для совместимости
        connector.send({
            func_name: "sign",
            params: {
              "containerId": containerId,
              "userPin": userPin ? userPin : '',
              "inDataType": ifcDataType,
              "data": data,
              "hashType": IFCConst.IFC_HARDWARE_HASH,
              "signType": ifcSignType,
              "cspUI": cspUI,
              "outDataType": IFCConst.IFC_BASE64
            }
          },
          callback);
      });
    }

    /**@private*/
    function verify(containerId, sign, signType, data, dataType, peerCertificate, callback) {
      if (peerCertificate) {
        getCertificateHandleFromString(peerCertificate, function (msg) {
          if (IFCError.IFC_OK !== msg.error_code) {
            callback(msg);
            return;
          }

          var x509Handle = msg.x509Handle;
          connector.send({
              func_name: "verify",
              params: {
                "containerId": containerId,
                "inDataType": dataType,
                "data": data,
                "signType": signType,
                "sign": sign,
                "x509Handle": x509Handle
              }
            },
            function (msg) {
              var err_code = msg.error_code;
              var verify_result;
              if (IFCError.IFC_OK === msg.error_code) {
                verify_result = msg.verify_result;
              }

              // Free certificate
              freeCertificateHandle(x509Handle, function (msg) {
                if (IFCError.IFC_OK === msg.error_code)
                  callback({"error_code": err_code, "verify_result": verify_result});
                else
                  callback(msg);
              });
            });
        });
      } else {
        // NO PEER CERTIFICATE
        connector.send({
            func_name: "verify",
            params: {
              "containerId": containerId,
              "inDataType": dataType,
              "data": data,
              "signType": signType,
              "sign": sign,
              "x509Handle": 0
            }
          },
          callback);
      }
    }

    function sign_xml(containerId, userPin, wsu_id, data, inDataType, outDataType, callback, cspUI) {
      getCryptoById(getCryptoIdByContainerId(containerId), function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        if (typeof cspUI === "undefined") {
          cspUI = 1;
        }

        connector.send({
            func_name: "sign_xml",
            params: {
              "containerId": containerId,
              "userPin": userPin ? userPin : '',
              "wsu_id": wsu_id,
              "inDataType": inDataType,
              "data": data,
              "cspUI": cspUI,
              "outDataType": outDataType
            }
          },
          callback);
      });
    }

    function verify_xml(containerId, wsu_id, sign, inDataType, callback) {

      connector.send({
          func_name: "verify_xml",
          params: {
            "containerId": containerId,
            "wsu_id": wsu_id,
            "inDataType": inDataType,
            "sign": sign,

          }
        },
        function (msg) {
          if (IFCError.IFC_OK === msg.error_code)
            callback({"error_code": msg.error_code, "verify_result": msg.verify_result});
          else
            callback(msg);


        });
    }

    /**@private*/
    function getHashByDataType(containerId, dataType, data, callback) {
      connector.send({
        func_name: "hash",
        params: {
          "containerId": containerId,
          "inDataType": dataType,
          "data": data,
          "outDataType": IFCConst.IFC_BASE64
        }
      }, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }
        callback({"error_code": IFCError.IFC_OK, "hash": new IFCHash(msg.hashValue)});
      });

    }

    function generateKeyPairAndCsrExtended(containerId, userPin, subjectDN, extendedKeyUsage, certificatePolicies, callback) {
      return generateKeyPairAndCsrV2Extended(containerId, userPin, subjectDN, extendedKeyUsage, certificatePolicies, "", callback);
    }

    function generateKeyPairAndCsrV2Extended(containerId, userPin, subjectDN, extendedKeyUsage, certificatePolicies, csrExtensions, callback) {
      connector.send({
        func_name: "key_gen",
        params: {"containerId": containerId, "userPin": userPin}
      }, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var dn = new IFCDN(subjectDN, IFCConst.DN_SEPARATOR_INPUT);
        var dn_array = dn.getSubjectArray();

        var extendedKeyUsage_str = "clientAuth,emailProtection," + "1.2.643.2.2.34.6," + extendedKeyUsage;
        var extendedKeyUsage_json_array = extendedKeyUsage_str.split(",");
        var certificatePolicies_json_array = certificatePolicies.split(",");
        var real_key_id = msg.real_id;

        connector.send({
          func_name: "req_gen",
          params: {
            "containerId": real_key_id,
            "userPin": userPin,
            "subject": dn_array,
            "extendedKeyUsage": extendedKeyUsage_json_array,
            "certificatePolicies": certificatePolicies_json_array,
            "signInstrument": "",
            "req_format": IFCConst.IFC_REQ_BASE64ENCODED,
            "csrExtensions": csrExtensions
          }
        }, function (msg) {
          if (IFCError.IFC_OK !== msg.error_code) {
            callback(msg);
            return;
          }
          callback({
            "error_code": IFCError.IFC_OK,
            "real_id": real_key_id,
            "req_base64_length": msg.req_base64_length,
            "req_base64": msg.req_base64,
            "req": new IFCCertificateRequest(real_key_id, msg.req_base64)
          });
        });
      });
    }

    /**@private
     * @description Возвращает перечень сертификатов, доступных для Модуля, в виде массива объектов IFCCertificate.
     * */
    function getCertificateList(callback, show_progress) {
      getCryptoList(function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var crypto_array = msg.ifc_list;
        var cryptoID_array = [];
        for (var i = 0; i < crypto_array.length; i++) {
          cryptoID_array.push(crypto_array[i].getCryptoId());
        }

        connector.send({
          func_name: "get_list_certs_by_cryptoid_array",
          params: {"cryptoID_array": cryptoID_array, "show_progress": show_progress}
        }, function (msg) {
          if (IFCError.IFC_OK !== msg.error_code) {
            callback(msg);
            return;
          }

          if (msg.intermediate) {
            callback(msg);
            return;
          }


          var certsArray = [];
          for (var i = 0; i < msg.result_array.length; i++) {
            var cur_crypto = false;

            // Находим объект IFCCrypto по ID
            for (var j = 0; j < crypto_array.length; j++) {
              if (crypto_array[j].getCryptoId() === msg.result_array[i].crypto_id) {
                cur_crypto = crypto_array[j];
                break;
              }
            }
            if (cur_crypto === false)
              continue;

            // Находим сертификаты для этого СКЗИ
            for (var z = 0; z < msg.result_array[i].cert_list.length; z++) {
              certsArray.push(new IFCCertificate(msg.result_array[i].cert_list[z], cur_crypto));
            }
          }
          callback({"error_code": IFCError.IFC_OK, "certs_list": certsArray});
        });
      });
    }

    /**@private
     * @description Возвращает перечень сертификатов, в виде массива объектов IFCCertificate.
     * Поиск сертификатов производится на СКЗИ, заданном с помощью идентификатора СКЗИ (cryptoId).
     * */
    function getCertificateListByCryptoId(cryptoId, callback) {
      getCryptoById(cryptoId, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var crypto = msg.crypto;
        connector.send({func_name: "get_list_certs", params: {"cryptoID": crypto.getCryptoId()}}, function (msg) {
          if (IFCError.IFC_OK !== msg.error_code) {
            callback(msg);
            return;
          }

          certsArray = [];
          for (var i = 0; i < msg.cert_list.length; i++) {
            certsArray.push(new IFCCertificate(msg.cert_list[i], crypto));
          }
          callback({"error_code": IFCError.IFC_OK, certs_list: certsArray});
        });
      });
    }

    /**@private
     * @description Возвращает перечень ключевых контейнеров, в виде массива объектов IFCCertificate.
     * Поиск сертификатов производится на СКЗИ, заданном с помощью идентификатора СКЗИ (cryptoId).
     * Отображает в том числе контейнеры, в которых не содержится сертификата.
     * */
    function getKeyListByCryptoId(cryptoId, userPin, callback) {
      getCryptoById(cryptoId, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var crypto = msg.crypto;
        if (!(userPin && userPin.length > 0) && crypto.isPKCS11()) {
          callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        }

        connector.send({
          func_name: "get_list_keys",
          params: {"cryptoID": crypto.getCryptoId(), "userPin": userPin}
        }, function (msg) {
          if (IFCError.IFC_OK !== msg.error_code) {
            callback(msg);
            return;
          }

          keysArray = [];
          for (var i = 0; i < msg.keys_list.length; i++) {
            keysArray.push(new IFCCertificate(msg.keys_list[i], crypto));
          }

          callback({"error_code": IFCError.IFC_OK, keys_list: keysArray});
        });
      });
    }

    /**@private
     * @description Генерация ключевой пары и CSR. ContainerId задается входным параметром.
     * @returns {IFCCertificateRequest} Объект содержит заданный идентификатор контейнера и значение запроса на сертификат, кодированное в Base64.
     * */
    function generateKeyPairAndCsrForContainerId(containerId, userPin, subjectDN, callback) {
      return generateKeyPairAndCsrForContainerIdV2(containerId, userPin, subjectDN, "", callback);
    }

    function generateKeyPairAndCsrForContainerIdV2(containerId, userPin, subjectDN, csrExtensions, callback) {
      var cryptoId = getCryptoIdByContainerId(containerId);

      getCryptoById(cryptoId, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        if (!(userPin && userPin.length > 0) && msg.crypto.isPKCS11()) {
          callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
          return;
        }

        generateKeyPairAndCsrV2Extended(containerId, userPin, subjectDN, msg.crypto.getExtendedKeyUsage(), msg.crypto.getCertificatePolicies(), csrExtensions, callback)
      })
    }

    /**@private
     * @description Создание самоподписанного сертификата
     * */
    function makeSelfSignedCert(containerId, userPin, request, callback) {
      var cryptoId = getCryptoIdByContainerId(containerId);

      getCryptoById(cryptoId, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        if (!(userPin && userPin.length > 0) && msg.crypto.isPKCS11()) {
          callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
          return;
        }
        connector.send({
          func_name: "make_cert",
          params: {"containerId": containerId, "userPin": userPin, "request": request}
        }, function (msg) {
          callback(msg);
        });
      });

    }

    /**@private
     * @description Генерация псевдослучайного GUID. GUID используется при генерации уникальных containerId
     * */
    function getGuid(callback) {
      connector.send({func_name: "get_guid", params: {"prefix": guidPrefix}}, callback);
    }

    /**@private
     * @description Генерация ключевой пары и CSR.
     * */
    function generateKeyPairAndCsr(cryptoId, userPin, subjectDN, callback) {
      return generateKeyPairAndCsrV2(cryptoId, userPin, subjectDN, "", callback);
    }

    function generateKeyPairAndCsrV2(cryptoId, userPin, subjectDN, csrExtensions, callback) {
      getGuid(function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var containerId = cryptoId + "/" + msg.guid;

        return generateKeyPairAndCsrForContainerIdV2(containerId, userPin, subjectDN, csrExtensions, callback);
      })
    }

    /**@private
     * @description Удаляет ключевой контейнер.
     * */
    function deleteContainer(containerId, userPin, callback) {
      getCryptoById(getCryptoIdByContainerId(containerId), function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var crypto = msg.crypto;
        if (!(userPin && userPin.length > 0) && crypto.isPKCS11()) {
          callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
          return;
        }

        connector.send({
          func_name: "key_delete",
          params: {"containerId": containerId, "userPin": userPin}
        }, callback);
      });
    }

    function getCertificateHandleFromString(dataString, callback) {
      connector.send({
        func_name: "load_x509_from_data",
        params: {"cert": dataString, "cert_data_type": IFCConst.IFC_CERT_UNKNOWN}
      }, callback);
    }

    function getCertificateHandleFromContainerID(containerId, callback) {
      connector.send({func_name: "load_x509_from_container", params: {"containerId": containerId}}, callback);
    }

    function freeCertificateHandle(x509Handle, callback) {
      connector.send({func_name: "free_x509", params: {"x509Handle": x509Handle}}, callback);
    }

    function getCertificateByHandle(x509Handle, callback) {
      // Set the certificate to a container
      connector.send({func_name: "get_x509_info", params: {"x509Handle": x509Handle}}, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var cert = new IFCCertificateInfo(msg.cert_info);
        callback({"error_code": msg.error_code, "cert": cert});
      });
    }

    /**@private
     * @description Получает сертификат в виде строки base64 и возвращает по нему подробную информацию.
     * */
    function getCertificateFromString(dataString, callback) {
      getCertificateHandleFromString(dataString, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var x509Handle = msg.x509Handle;

        // Set the certificate to a container
        getCertificateByHandle(x509Handle, function (msg) {
          if (IFCError.IFC_OK !== msg.error_code) {
            callback(msg);
            return;
          }

          var cert = msg.cert;

          // Free certificate handle
          freeCertificateHandle(x509Handle, function (msg) {
            callback({"error_code": msg.error_code, "cert": cert});
          });
        });
      });
    }

    /**@private
     * @description Извлекает сертификат из контейнера и возвращает по нему подробную информацию.
     * */
    function getCertificate(containerId, callback) {
      getCertificateHandleFromContainerID(containerId, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        var x509Handle = msg.x509Handle;

        // Set the certificate to a container
        connector.send({func_name: "get_x509_info", params: {"x509Handle": x509Handle}}, function (msg) {
          if (IFCError.IFC_OK !== msg.error_code) {
            callback(msg);
            return;
          }

          var cert = new IFCCertificateInfo(msg.cert_info);
          // Free certificate
          freeCertificateHandle(x509Handle, function (msg) {
            callback({"error_code": msg.error_code, "cert": cert});
          });
        });
      });
    }


    /**@private
     * @description Записывает сертификат в ключевой контейнер.
     * */
    function putCertificate(containerId, userPin, certificateValue, callback) {
      var cryptoId = getCryptoIdByContainerId(containerId);

      getCryptoById(cryptoId, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        if (!(userPin && userPin.length > 0) && msg.crypto.isPKCS11()) {
          callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
          return;
        }

        // Load certificate from BASE64-data or PEM-data
        getCertificateHandleFromString(certificateValue, function (msg) {
          if (IFCError.IFC_OK !== msg.error_code) {
            callback(msg);
            return;
          }
          var x509Handle = msg.x509Handle;

          // Set the certificate to a container
          connector.send({
            func_name: "set_x509",
            params: {"containerId": containerId, "userPin": userPin, "x509Handle": x509Handle}
          }, function (msg) {
            if (IFCError.IFC_OK !== msg.error_code) {
              callback(msg);
              return;
            }

            // Free certificate
            freeCertificateHandle(x509Handle, function (msg) {
              callback(msg);
              return;
            });
          });
        });
      });
    }


    /**@private
     * @description Шифрует входные данные, используя:
     * - контейнер с ключевой парой и сертификатом отправителя (обращается к нему по containerId);
     * - сертификат получателя (принимается в Base64).
     * Входные данные должны быть в Base64.
     * */
    function encrypt(containerId, userPin, peerCertificateBase64, data, callback) {
      if (!(userPin && userPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }

      getCertificateHandleFromString(peerCertificateBase64, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        peer_x509Handle = msg.x509Handle;

        connector.send({
            func_name: "encrypt",
            params: {
              "containerId": containerId,
              "userPin": userPin,
              "peerX509Handle": peer_x509Handle,
              "data": data
            }
          },
          function (msg) {
            var err_code = msg.error_code;
            var result;
            if (IFCError.IFC_OK === msg.error_code) {
              result = new IFCEncrypted(msg.enc_data_base64, msg.enc_key_base64, msg.cert_base64);
            }

            // Free certificate
            freeCertificateHandle(peer_x509Handle, function (msg) {
              if (IFCError.IFC_OK !== msg.error_code) {
                callback(msg);
                return;
              }

              if (IFCError.IFC_OK === err_code)
                callback({"error_code": err_code, "encrypted": result});
              else
                callback({"error_code": err_code});
            });
          });
      });
    }

    /**@private
     * @description Расшифровывает входные данные, используя:
     * - контейнер с ключевой парой и сертификатом получателя (обращается к нему по containerId);
     * - сертификат отправителя (принимается в Base64);
     * - зашифрованный сессионный ключ.
     * Входные данные должны быть в Base64.
     * */
    function decrypt(containerId, userPin, peerCertificateBase64, encryptedData, encryptedKey, callback) {
      if (!(userPin && userPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }

      getCertificateHandleFromString(peerCertificateBase64, function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        peer_x509Handle = msg.x509Handle;

        connector.send({
            func_name: "decrypt",
            params: {
              "containerId": containerId,
              "userPin": userPin,
              "peerX509Handle": peer_x509Handle,
              "encryptedData": encryptedData,
              "encryptedKey": encryptedKey
            }
          },
          function (msg) {
            var err_code = msg.error_code;
            var result;
            if (IFCError.IFC_OK === msg.error_code) {
              result = msg.decrypted;
            }

            // Free certificate
            freeCertificateHandle(peer_x509Handle, function (msg) {
              if (IFCError.IFC_OK !== msg.error_code) {
                callback(msg);
                return;
              }

              if (IFCError.IFC_OK === err_code)
                callback({"error_code": err_code, "decrypted": result});
              else
                callback({"error_code": err_code});
            });
          });
      });
    }

    // Специфичные для PKCS#11 методы

    /**@private
     * @description Инициализация СКЗИ. Только для PKCS#11.
     * */
    function pkcs11Init(cryptoId, cryptoDescription, userPin, adminPin, callback) {
      if (!(userPin && userPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }
      if (!(adminPin && adminPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }

      connector.send({
        func_name: "p11_init",
        params: {"cryptoID": cryptoId, "label": cryptoDescription, "userPin": userPin, "adminPin": adminPin}
      }, callback);
    }

    /**@private
     * @description Смена ПИН-кода пользователя для СКЗИ. Только для PKCS#11.
     * */
    function pkcs11ChangeUserPin(cryptoId, currentPin, newPin, callback) {
      if (!(currentPin && currentPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }
      if (!(newPin && newPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }

      connector.send({
        func_name: "p11_pin_change",
        params: {
          "cryptoID": cryptoId,
          "pinType": IFCConst.P11_PIN_TYPE_USER,
          "currentPin": currentPin,
          "newPin": newPin
        }
      }, callback);
    }

    /**@private
     * @description Разблокировать ПИН-код пользователя СКЗИ. Только для PKCS#11.
     * */
    function pkcs11UnlockUserPin(cryptoId, adminPin, callback) {
      if (!(adminPin && adminPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }

      connector.send({func_name: "p11_pin_unlock", params: {"cryptoID": cryptoId, "adminPin": adminPin}}, callback);
    }

    /**@private
     * @description  Смена ПИН-кода администратора для СКЗИ. Только для PKCS#11.
     * */
    function pkcs11ChangeAdminPin(cryptoId, currentPin, newPin, callback) {
      if (!(currentPin && currentPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }
      if (!(newPin && newPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }

      connector.send({
        func_name: "p11_pin_change",
        params: {
          "cryptoID": cryptoId,
          "pinType": IFCConst.P11_PIN_TYPE_ADMIN,
          "currentPin": currentPin,
          "newPin": newPin
        }
      }, callback);
    }

    /**@private
     * @description Изменяет идентификатор контейнера, сохраненного на СКЗИ. Только для PKCS#11.
     * */
    function pkcs11RenameContainer(containerId, newContainerId, userPin, callback) {
      if (!(userPin && userPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }
      connector.send({
        func_name: "p11_key_rename",
        params: {"containerId": containerId, "newContainerId": newContainerId, "userPin": userPin}
      }, callback);
    }


    /**@private
     * @description "Перемещает" контейнер из oldContainerId в newContainerId. Только для PKCS#11.
     * Алгоритм: удаляет контейнер с newContainerId, если он существует. Переименовывает контейнер
     * oldContainerId в newContainerId
     * */
    function pkcs11MoveContainer(oldContainerId, newContainerId, userPin, callback) {
      if (!(userPin && userPin.length > 0)) {
        callback({"error_code": IFCError.IFC_P11_INVALID_PIN_ERROR});
        return;
      }

      getCryptoById(getCryptoIdByContainerId(oldContainerId), function (msg) {
        if (IFCError.IFC_OK !== msg.error_code) {
          callback(msg);
          return;
        }

        if (msg.crypto == null || !msg.crypto.isPKCS11()) {
          callback({"error_code": IFCError.IFC_BAD_PARAMS});
          return;
        }

        // deleting the old container
        var containerToDelete = getCryptoIdByContainerId(oldContainerId) + "/" + newContainerId;
        deleteContainer(containerToDelete, userPin, function (msg) {
          if (IFCError.IFC_OK === msg.error_code || IFCError.IFC_CONTAINER_NOT_FOUND === msg.error_code) {
            pkcs11RenameContainer(oldContainerId, newContainerId, userPin, callback);
          }
        });
      });
    }


    // Методы низкоуровнего взаимодействия со смарт-картами

    /**@private
     *  @description Отправка подключенной смарт-карте или криптотокену APDU-команды.
     * */
    function sendAPDU(readerName, requestData, callback) {
      connector.send({
        func_name: "send_apdu",
        params: {"readerName": readerName, "apdu_string": requestData}
      }, callback);
    }


    ///////////////////////////////////////////////
    // Публичные методы библиотеки
    ///////////////////////////////////////////////

    /**@public
     * @description Инициализация и запуск мониторинга состояния соединения с плагином
     * */
    this.init = function (initOnLoad) {
      var that = this;
      var timeout = null;

      this.status = {
        isNativeMessaging: isNativeMessaging(),
        isNewSafari: isNewSafari(),
        extensionIsInstalled: null,
        pluginIsRunning: null
      };

      if (initOnLoad) {
        if (this.status.isNewSafari) {
          timeout = 5000;
        } else {
          timeout = 500;
        }
      } else {
        timeout = 4;
      }

      if (this.status.isNativeMessaging) {

        setTimeout(function () {
          if (document.getElementById('ifcplugin-extension-is-installed')) {
            that.status.extensionIsInstalled = true;

            if (document.getElementById('ifc-plugin-is-installed')) {
              that.status.pluginIsRunning = true;
            } else {
              that.status.pluginIsRunning = false;
            }
          } else {
            that.status.extensionIsInstalled = false;
          }

          triggerPluginEvent('updatePluginStatus');
        }, timeout);
      } else {
        this.status.pluginIsRunning = false;

        this.getPluginVersion(function (msg) {
          if (IFCError.IFC_OK === msg.error_code) {
            that.status.pluginIsRunning = true;
          }
        });

        setTimeout(function () {
          triggerPluginEvent('updatePluginStatus');
        }, 1000);
      }

      setTimeout(that.init.bind(that), 5000);
    };

    /**@public
     * @description Возвращает версию библиотеки.
     * @returns {String} Формат версии: X.X.X
     * */
    this.getLibVersion = function (callback) {
      return libVersion;
    };

    /**@public
     * @description Создает IFCPlugin: Инициализация и настройка Плагина
     * */
    this.create = function (file_config, config_string, callback) {
      connector.send({
        func_name: "create",
        params: {
          "file_config": file_config,
          "config_string": config_string,
          "log_file_location": "",
          "plugin_log_level": ""
        }
      }, callback);
    };

    /**@public
     * @description Возвращает версию плагина.
     * */
    this.getPluginVersion = function (callback) {
      connector.send({func_name: "version"}, callback);
    };

    /**@public
     * @description Возвращает перечень СКЗИ, доступных для плагина, в виде массива объектов IFCCrypto.
     * */
    this.getCryptoList = function (callback) {
      return getCryptoList(callback);
    };

    /**@public
     * @description Возвращает перечень СКЗИ, доступных для плагина через интерфейс PKCS#11, в виде массива объектов IFCCrypto.
     * */
    this.getPKCS11CryptoList = function (callback) {
      return getCryptoListByType(IFCConst.IFC_CRYPTO_PKCS11, callback);
    };

    /**@public
     * @description Возвращает перечень СКЗИ, доступных для плагина через интерфейс CAPI, в виде массива объектов IFCCrypto.
     * */
    this.getCAPICryptoList = function (callback) {
      return getCryptoListByType(IFCConst.IFC_CRYPTO_CAPI, callback);
    };

    /**@public
     * @description Возвращает перечень СКЗИ, доступных для плагина через интерфейс CAPI под LINUX, в виде массива объектов IFCCrypto.
     * */
    this.getCAPILINUXCryptoList = function (callback) {
      return getCryptoListByType(IFCConst.IFC_CRYPTO_CAPI_LINUX, callback);
    };

    /**@public
     * @description Возвращает информацию о СКЗИ (объект IFCCrypto), по переданному на вход cryptoId.
     * */
    this.getCryptoById = function (cryptoId, callback) {
      return getCryptoById(cryptoId, callback);
    };


    /**@public
     * @description Возвращает перечень сертификатов, доступных для Модуля, в виде массива объектов IFCCertificate.
     * */
    this.getCertificateList = function (callback) {
      return getCertificateList(callback, 0);
    };

    /**@public
     * @description Возвращает перечень сертификатов, доступных для Модуля, в виде массива объектов IFCCertificate и прогресс обработки сертификатов.
     * */
    this.getCertificateListWithProgress = function (callback) {
      return getCertificateList(callback, 1);
    };

    /**@public
     * @description Возвращает перечень сертификатов, в виде массива объектов IFCCertificate.
     * Поиск сертификатов производится на СКЗИ, заданном с помощью идентификатора СКЗИ (cryptoId).
     * */
    this.getCertificateListByCryptoId = function (cryptoId, callback) {
      return getCertificateListByCryptoId(cryptoId, callback);
    };

    /**@public
     * @description Возвращает перечень ключевых контейнеров, в виде массива объектов IFCCertificate.
     * Поиск сертификатов производится на СКЗИ, заданном с помощью идентификатора СКЗИ (cryptoId).
     * Отображает в том числе контейнеры, в которых не содержится сертификата.
     * */
    this.getKeyListByCryptoId = function (cryptoId, userPin, callback) {
      return getKeyListByCryptoId(cryptoId, userPin, callback);
    };

    /**@public
     * @description Получение идентификатора криптоустройства по ContainerId.
     * */
    this.getCryptoIdByContainerId = function (callback) {
      return getCryptoIdByContainerId(callback);
    };

    // Методы работы с электронной подписью

    /**@public
     * @description Формирует подпись в формате XML
     */
    this.signDataXml = function (containerId, pin, wsu_id, data, outDataType, callback, cspUI) {
      return sign_xml(containerId, pin, wsu_id, data, IFCConst.IFC_DATATYPE_DATA, outDataType, callback, cspUI)
    };

    if (testFunctionsEnabled) {
      this.verifyDataXml = function (containerId, wsu_id, signature, callback) {
        return verify_xml(containerId, wsu_id, signature, IFCConst.IFC_DATATYPE_DATA, callback);
      }
    }

    /**@public
     * @description Декодирует из base64 данные входной строки и Формирует подпись в формате XML
     */
    this.signDataBase64Xml = function (containerId, pin, wsu_id, data, outDataType, callback, cspUI) {
      return sign_xml(containerId, pin, wsu_id, data, IFCConst.IFC_DATATYPE_DATA_BASE64, outDataType, callback, cspUI)
    };

    if (testFunctionsEnabled) {
      this.verifyDataBase64Xml = function (containerId, wsu_id, signature, callback) {
        return verify_xml(containerId, wsu_id, signature, IFCConst.IFC_DATATYPE_DATA_BASE64, callback);
      }
    }

    /**@public
     * @description Формирует электронную подпись в формате CMS Attached для переданной строки данных.
     * */
    this.signDataCmsAttached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA, IFCConst.IFC_SIGNTYPE_CMS_ATTACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataCmsAttached = function (containerId, signature, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CMS_ATTACHED, "", IFCConst.IFC_DATATYPE_DATA, "", callback);
      }
    }

    /**@public
     * @description Формирует электронную подпись в формате CMS Detached для переданной строки данных.
     * */
    this.signDataCmsDetached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA, IFCConst.IFC_SIGNTYPE_CMS_DETACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataCmsDetached = function (containerId, signature, data, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CMS_DETACHED, data, IFCConst.IFC_DATATYPE_DATA, "", callback);
      }
    }

    /**@public
     * @description Формирует электронную подпись в формате CAdES-BES Attached для переданной строки данных.
     * */
    this.signDataCadesBesAttached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA, IFCConst.IFC_SIGNTYPE_CADES_BES_ATTACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataCadesBesAttached = function (containerId, signature, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CADES_BES_ATTACHED, "", IFCConst.IFC_DATATYPE_DATA, "", callback);
      }
    }

    /**@public
     * @description Формирует электронную подпись в формате CAdES-BES Detached для переданной строки данных.
     * */
    this.signDataCadesBesDetached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA, IFCConst.IFC_SIGNTYPE_CADES_BES_DETACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataCadesBesDetached = function (containerId, signature, data, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CADES_BES_DETACHED, data, IFCConst.IFC_DATATYPE_DATA, "", callback);
      }
    }

    /**@public
     * @description Декодирует из base64 данные входной строки. Формирует электронную подпись для декодированного содержимого
     * в формате CMS Attached.
     * */
    this.signDataBase64CmsAttached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA_BASE64, IFCConst.IFC_SIGNTYPE_CMS_ATTACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataBase64CmsAttached = function (containerId, signature, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CMS_ATTACHED, "", IFCConst.IFC_DATATYPE_DATA_BASE64, "", callback);
      }
    }

    /**@public
     * @description Декодирует из base64 данные входной строки. Формирует электронную подпись для декодированного содержимого
     * в формате CMS Detached.
     * */
    this.signDataBase64CmsDetached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA_BASE64, IFCConst.IFC_SIGNTYPE_CMS_DETACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataBase64CmsDetached = function (containerId, signature, data, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CMS_DETACHED, data, IFCConst.IFC_DATATYPE_DATA_BASE64, "", callback);
      }
    }

    /**@public
     * @description Декодирует из base64 данные входной строки. Формирует электронную подпись для декодированного содержимого
     * в формате CAdES-BES Attached.
     * */
    this.signDataBase64CadesBesAttached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA_BASE64, IFCConst.IFC_SIGNTYPE_CADES_BES_ATTACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataBase64CadesBesAttached = function (containerId, signature, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CADES_BES_ATTACHED, "", IFCConst.IFC_DATATYPE_DATA_BASE64, "", callback);
      }
    }

    /**@public
     * @description Декодирует из base64 данные входной строки. Формирует электронную подпись для декодированного содержимого
     * в формате CAdES-BES Detached.
     * */
    this.signDataBase64CadesBesDetached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA_BASE64, IFCConst.IFC_SIGNTYPE_CADES_BES_DETACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataBase64CadesBesDetached = function (containerId, signature, data, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CADES_BES_DETACHED, data, IFCConst.IFC_DATATYPE_DATA_BASE64, "", callback);
      }
    }

    /**@public
     * @description Декодирует из base64 данные входной строки, содержащей хеш для подписания.
     * Формирует электронную подпись для декодированного содержимого
     * в формате CMS Detached.
     * */
    this.signDataHash64CmsDetached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_HASH_BASE64, IFCConst.IFC_SIGNTYPE_CMS_DETACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataHash64CmsDetached = function (containerId, signature, data, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CMS_DETACHED, data, IFCConst.IFC_DATATYPE_HASH_BASE64, "", callback);
      }
    }

    /**@public
     * @description Декодирует из base64 данные входной строки, содержащей хеш для подписания.
     * Формирует электронную подпись для декодированного содержимого
     * в формате CAdES-BES Detached.
     * */
    this.signDataHash64CadesBesDetached = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_HASH_BASE64, IFCConst.IFC_SIGNTYPE_CADES_BES_DETACHED, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataHash64CadesBesDetached = function (containerId, signature, data, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_CADES_BES_DETACHED, data, IFCConst.IFC_DATATYPE_HASH_BASE64, "", callback);
      }
    }

    /**@public
     * @description Формирует "сырую" электронную подпись данных, прямой порядок байт.
     * */
    this.signDataSimple = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA, IFCConst.IFC_SIGNTYPE_SIMPLE, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataSimple = function (containerId, signature, data, peerCertificate, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_SIMPLE, data, IFCConst.IFC_DATATYPE_DATA, peerCertificate, callback);
      }
    }

    /**@public
     * @description Формирует "сырую" электронную подпись для поданного хеша, прямой порядок байт. Хеш должен быть кодирован в Base64.
     * */
    this.signHashSimple = function (containerId, pin, hash, callback, cspUI) {
      return sign(containerId, pin, hash, IFCConst.IFC_DATATYPE_HASH_BASE64, IFCConst.IFC_SIGNTYPE_SIMPLE, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyHashSimple = function (containerId, signature, hash, peerCertificate, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_SIMPLE, hash, IFCConst.IFC_DATATYPE_HASH_BASE64, peerCertificate, callback);
      }
    }

    /**@public
     * @description Формирует "сырую" электронную подпись данных, обратный порядок байт.
     * */
    this.signDataSimpleReversed = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA, IFCConst.IFC_SIGNTYPE_SIMPLE_REVERSE, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataSimpleReversed = function (containerId, signature, data, peerCertificate, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_SIMPLE_REVERSE, data, IFCConst.IFC_DATATYPE_DATA, peerCertificate, callback);
      }
    }

    /**@public
     * @description Декодирует из base64 данные входной строки. Формирует "сырую" электронную подпись.
     * */
    this.signDataBase64Simple = function (containerId, pin, data, callback, cspUI) {
      return sign(containerId, pin, data, IFCConst.IFC_DATATYPE_DATA_BASE64, IFCConst.IFC_SIGNTYPE_SIMPLE, callback, cspUI);
    };

    if (testFunctionsEnabled) {
      this.verifyDataBase64Simple = function (containerId, signature, data, peerCertificate, callback) {
        return verify(containerId, signature, IFCConst.IFC_SIGNTYPE_SIMPLE, data, IFCConst.IFC_DATATYPE_DATA_BASE64, peerCertificate, callback);
      }
    }

    // Методы для работы с ключевыми парами и сертификатами

    /**@public
     * @description Генерация ключевой пары и CSR. ContainerId задается входным параметром.
     * @returns {IFCCertificateRequest} Объект содержит заданный идентификатор контейнера и значение запроса на сертификат, кодированное в Base64.
     * */
    this.generateKeyPairAndCsrForContainerId = function (containerId, userPin, subjectDN, callback) {
      return generateKeyPairAndCsrForContainerId(containerId, userPin, subjectDN, callback);
    };

    /**@public
     * @description Генерация ключевой пары и CSR. ContainerId задается входным параметром. Обновленная версия с возможностью добавлять в CSR расширения
     * @returns {IFCCertificateRequest} Объект содержит заданный идентификатор контейнера и значение запроса на сертификат, кодированное в Base64.
     * */
    this.generateKeyPairAndCsrForContainerIdV2 = function (containerId, userPin, subjectDN, csrExtensions, callback) {
      return generateKeyPairAndCsrForContainerIdV2(containerId, userPin, subjectDN, csrExtensions, callback);
    };

    /**@public
     * @description Генерация ключевой пары и CSR.
     * */
    this.generateKeyPairAndCsr = function (cryptoId, userPin, subjectDN, callback) {
      return generateKeyPairAndCsr(cryptoId, userPin, subjectDN, callback);
    };

    /**@public
     * @description Генерация ключевой пары и CSR. Обновленная версия с возможностью добавлять в CSR расширения
     * */
    this.generateKeyPairAndCsrV2 = function (cryptoId, userPin, subjectDN, csrExtensions, callback) {
      return generateKeyPairAndCsrV2(cryptoId, userPin, subjectDN, csrExtensions, callback);
    };

    if (testFunctionsEnabled) {
      /**@public
       * @description Создание самоподписанного сертификата.
       * */
      this.makeSelfSignedCert = function (containerId, userPin, request, callback) {
        return makeSelfSignedCert(containerId, userPin, request, callback);
      }
    }

    /**@public
     * @description Записывает сертификат в ключевой контейнер.
     * */
    this.putCertificate = function (containerId, userPin, certificateValue, callback) {
      return putCertificate(containerId, userPin, certificateValue, callback);
    };

    /**@public
     * @description Удаляет ключевой контейнер.
     * */
    this.deleteContainer = function (containerId, userPin, callback) {
      return deleteContainer(containerId, userPin, callback);
    };

    // Методы работы с GUID
    /**@public
     * @description Генерация псевдослучайного GUID. GUID используется при генерации уникальных containerId
     * */
    this.getGuid = function (callback) {
      return getGuid(callback);
    };

    /**@public
     * @description Устанавливает префикс, используемый для генерации GUID.
     * */
    this.setGuidPrefix = function (newPrefix) {
      guidPrefix = newPrefix;
    };

    /**@public
     * @description Возвращает текущий префикс, используемый для генерации GUID.
     * */
    this.getGuidPrefix = function () {
      return guidPrefix;
    };


    /**@public
     * @description Извлекает сертификат из контейнера и возвращает по нему подробную информацию.
     * */
    this.getCertificate = function (containerId, callback) {
      return getCertificate(containerId, callback);
    };

    /**@public
     * @description Получает сертификат в виде строки base64 и возвращает по нему подробную информацию.
     * */
    this.getCertificateFromString = function (dataString, callback) {
      return getCertificateFromString(dataString, callback);
    };

    // Методы работы с ХЭШ-функцией

    /**@public
     * @description Вычисляет хеш для входной строки данных.
     * */
    this.getHash = function (containerId, data, callback) {
      return getHashByDataType(containerId, IFCConst.IFC_DATATYPE_DATA, data, callback);
    };

    /**@public
     * @description Декодирует из base64 входную строку данных, вычисляет для декодированной строки хеш.
     * */
    this.getHashFromBase64 = function (containerId, data, callback) {
      return getHashByDataType(containerId, IFCConst.IFC_DATATYPE_DATA_BASE64, data, callback);
    };

    // Функции шифрования-расшифрования

    /**@public
     * @description Шифрует входные данные, используя:
     * - контейнер с ключевой парой и сертификатом отправителя (обращается к нему по containerId);
     * - сертификат получателя (принимается в Base64).
     * Входные данные должны быть в Base64.
     * */
    this.encrypt = function (containerId, userPin, peerCertificateBase64, data, callback) {
      return encrypt(containerId, userPin, peerCertificateBase64, data, callback);
    };

    /**@public
     * @description Расшифровывает входные данные, используя:
     * - контейнер с ключевой парой и сертификатом получателя (обращается к нему по containerId);
     * - сертификат отправителя (принимается в Base64);
     * - зашифрованный сессионный ключ.
     * Входные данные должны быть в Base64.
     * */
    this.decrypt = function (containerId, userPin, peerCertificateBase64, encryptedData, encryptedKey, callback) {
      return decrypt(containerId, userPin, peerCertificateBase64, encryptedData, encryptedKey, callback);
    };

    // Специфичные для PKCS#11 методы

    /**@public
     * @description Инициализация СКЗИ. Только для PKCS#11.
     * */
    this.pkcs11Init = function (cryptoId, cryptoDescription, userPin, adminPin, callback) {
      return pkcs11Init(cryptoId, cryptoDescription, userPin, adminPin, callback);
    };

    /**@public
     * @description Смена ПИН-кода пользователя для СКЗИ. Только для PKCS#11.
     * */
    this.pkcs11ChangeUserPin = function (cryptoId, currentPin, newPin, callback) {
      return pkcs11ChangeUserPin(cryptoId, currentPin, newPin, callback);
    };

    /**@public
     * @description Разблокировать ПИН-код пользователя СКЗИ. Только для PKCS#11.
     * */
    this.pkcs11UnlockUserPin = function (cryptoId, adminPin, callback) {
      return pkcs11UnlockUserPin(cryptoId, adminPin, callback);
    };

    /**@public
     * @description  Смена ПИН-кода администратора для СКЗИ. Только для PKCS#11.
     * */
    this.pkcs11ChangeAdminPin = function (cryptoId, currentPin, newPin, callback) {
      return pkcs11ChangeAdminPin(cryptoId, currentPin, newPin, callback);
    };

    /**@public
     * @description Изменяет идентификатор контейнера, сохраненного на СКЗИ. Только для PKCS#11.
     * */
    this.pkcs11RenameContainer = function (containerId, newContainerId, userPin, callback) {
      return pkcs11RenameContainer(containerId, newContainerId, userPin, callback);
    };


    /**@public
     * @description "Перемещает" контейнер из oldContainerId в newContainerId. Только для PKCS#11.
     * Алгоритм: удаляет контейнер с newContainerId, если он существует. Переименовывает контейнер
     * oldContainerId в newContainerId
     * */
    this.pkcs11MoveContainer = function (oldContainerId, newContainerId, userPin, callback) {
      return pkcs11MoveContainer(oldContainerId, newContainerId, userPin, callback);
    };


    // Методы низкоуровнего взаимодействия со смарт-картами

    /**@public
     *  @description Отправка подключенной смарт-карте или криптотокену APDU-команды.
     * */
    this.sendAPDU = function (readerName, requestData, callback) {
      return sendAPDU(readerName, requestData, callback);
    }
  }
})(window);

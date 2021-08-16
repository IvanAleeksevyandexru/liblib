(function (window) {
  /**
   * @class IFCCrypto
   * @description Содержит информацию о криптоустройстве (криптотокен, смарт-карта или криптопровайдер).
   */
  window.IFCCrypto = function (resultData) {
    /**@public
     * @description Метод возвращает псевдоним СКЗИ из конфигурационного файла Плагина
     * */
    this.getAlias = function () {
      return IFCConst.emptyString(resultData["alias"]);
    };

    /**@public
     * @description Метод возвращает название СКЗИ из конфигурационного файла Плагина
     * */
    this.getName = function () {
      return IFCConst.emptyString(resultData["name"]);
    };

    /**@public
     * @description Метод возвращает булево выражение: использует ли СКЗИ программный интерфейс PKCS#11
     * */
    this.isPKCS11 = function () {
      return (resultData["type"] === IFCConst.IFC_CRYPTO_PKCS11);
    };

    /**@public
     * @description Метод возвращает булево выражение: использует ли СКЗИ программный интерфейс CryptoAPI
     * */
    this.isCAPI = function () {
      return (resultData["type"] === IFCConst.IFC_CRYPTO_CAPI);
    };

    /**@public
     * @description Метод возвращает булево выражение: использует ли СКЗИ программный интерфейс CryptoAPI под linux
     * */
    this.isCAPI_LINUX = function () {
      return (resultData["type"] === IFCConst.IFC_CRYPTO_CAPI_LINUX);
    };

    /**@public
     * @description Метод возвращает
     * - для PKCS#11: путь доступа к библиотеке PKCS#11 из конфигурационного файла;
     * - для CAPI: имя криптопровайдера из конфигурационного файла
     * */
    this.getPath = function () {
      return IFCConst.emptyString(resultData["path"]);
    };

    /**@public
     * @description Метод возвращает номер криптопровайдера из конфигурационного файла или номер слота для PKCS#11-устройства
     * */
    this.getNumber = function () {
      return IFCConst.emptyString(resultData["num"]);
    };

    /**@public
     * @description Метод возвращает имя считывателя
     * */
    this.getDescription = function () {
      return IFCConst.emptyString(resultData["description"]);
    };

    /**@public
     * @description Метод возвращает серийный номер чипа токена/смарт-карты
     * */
    this.getSerialNumber = function () {
      return IFCConst.emptyString(resultData["serial_number"]);
    };

    /**@public
     * @description Метод возвращает модель токена/смарт-карты
     * */
    this.getModel = function () {
      return IFCConst.emptyString(resultData["model"]);
    };

    /**@public
     * @description Метод возвращает признак пропуска данных полученных с токенов через PKCS#11
     * */
    this.getSkipPKCS11List = function () {
      return IFCConst.emptyString(resultData["skip_pkcs11_list"]);
    };

    /**@public
     * @description Метод возвращает алгоритм используемы для генерации ключей через PKCS#11
     * */
    this.getAlg = function () {
      return IFCConst.emptyString(resultData["alg"]);
    };


    /**@public
     * @description Метод возвращает идентификатор СКЗИ (cryptoId)
     * */
    this.getCryptoId = function () {
      if (resultData["type"] === IFCConst.IFC_CRYPTO_PKCS11)
        resultData["crypto_id"] = resultData["alias"] + "/" + resultData["num"];
      else if ((resultData["type"] === IFCConst.IFC_CRYPTO_CAPI) || (resultData["type"] === IFCConst.IFC_CRYPTO_CAPI_LINUX))
        resultData["crypto_id"] = resultData["alias"];

      return IFCConst.emptyString(resultData['crypto_id']);
    };

    /**@private*/
    this.getExtendedKeyUsage = function () {
      var alias = this.getAlias();

      var eku = [
        {alias: "JaCarta", oid: "1.2.643.3.205.110.1"},
        {alias: "ruTokenECP", oid: "1.2.643.3.205.110.7"},
        {alias: "VIPNet", oid: "1.2.643.3.205.110.6"},
        {alias: "SignalCom", oid: "1.2.643.3.205.110.8"},
        {alias: "LISSI-CSP", oid: "1.2.643.3.205.110.9"},
        {alias: "CryptoPro", oid: "1.2.643.3.205.110.2"}];

      for (var i = 0; i < eku.length; i++) {
        if (alias.indexOf(eku[i].alias) >= 0) return eku[i].oid;
      }

      return "";
    };

    /**@private*/
    this.getCertificatePolicies = function () {
      var alias = this.getAlias();

      var cp = [
        {alias: "JaCarta", oid: IFCConst.OID_KC1 + "," + IFCConst.OID_KC2},
        {alias: "ruTokenECP", oid: IFCConst.OID_KC1 + "," + IFCConst.OID_KC2},
        {alias: "CryptoPro", oid: IFCConst.OID_KC1},
        {alias: "VIPNet", oid: IFCConst.OID_KC1},
        {alias: "SignalCom", oid: IFCConst.OID_KC1},
        {alias: "LISSI-CSP", oid: IFCConst.OID_KC1}];

      for (var i = 0; i < cp.length; i++) {
        if (alias.indexOf(cp[i].alias) >= 0) return cp[i].oid;
      }

      return IFCConst.OID_KC1;
    }
  }

  /**
   * @class IFCCertificate
   * @description Содержит информацию о сертификате ЭП
   */
  window.IFCCertificate = function (info, crypto) {

    /**@public
     * @description Метод возвращает серийный номер сертификата
     * */
    this.getSerialNumber = function () {
      return IFCConst.emptyString(info['cert_sn']);
    };

    /**@public
     * @description Метод возвращает сведения о субъекте сертификата
     * */
    this.getSubjectDN = function () {
      return new IFCDN(IFCConst.emptyString(info['cert_subject']), IFCConst.DN_SEPARATOR_PLUGIN);
    };

    /**@public
     * @description Метод возвращает сведения об издателе сертификата
     * */
    this.getIssuerDN = function () {
      return new IFCDN(IFCConst.emptyString(info['cert_issuer']), IFCConst.DN_SEPARATOR_PLUGIN);
    };

    /**@public
     * @description Метод возвращает срок начала действия сертификата
     * */
    this.getValidFrom = function () {
      return IFCConst.emptyString(this.checkDate(info['cert_valid_from']));
    };

    /**@public
     * @description Метод возвращает срок окончания действия сертификата
     * */
    this.getValidTo = function () {
      return IFCConst.emptyString(this.checkDate(info['cert_valid_to']));
    };

    /**@public
     * @description Метод возвращает алгоритмы подписи и хеширования в виде uri
     * */
    this.getSignAndDigestAlgUri = function () {

      var algOid = this.getSignAlgOid();

      if (algOid === IFCConst.OID_GOSTR3410_2012_256) {
        return {
          signMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr34102001-gostr3411",
          digestMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr3411"
        }
      } else if (algOid === IFCConst.OID_GOSTR3410_2012_512) {
        return {
          signMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr34102001-gostr3411",
          digestMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr3411"
        }
      } else if (algOid === IFCConst.OID_GOSTR3410_2001) {
        return {
          signMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr34102001-gostr3411",
          digestMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr3411"
        }
      } else {
        return {
          signMethod: "",
          digestMethod: ""
        }
      }
    };

    /**@public
     * @description Метод возвращает алгоритм подписи
     * */
    this.getSignAlg = function () {

      var algOid = this.getSignAlgOid();
      var algString;

      if (algOid === IFCConst.OID_GOSTR3410_2001) {
        algString = "gost_2001";
      } else if (algOid === IFCConst.OID_GOSTR3410_2012_256) {
        algString = "gost_2012_256";
      } else if (algOid === IFCConst.OID_GOSTR3410_2012_512) {
        algString = "gost_2012_512";
      } else {
        algString = "";
      }

      return algString;
    };

    /**@public
     * @description Метод возвращает oid алгоритма подписи
     * */
    this.getSignAlgOid = function () {
      return IFCConst.emptyString(info['cert_sign_alg']);
    };

    /**@public
     * @description Метод возвращает булево выражение: действителен ли сертификат на настоящий момент.
     * Проверка осуществляется сравнением текущего времени на ПК исполнения JavaScript-сценария
     * со значением IFCCertificate.getValidTo
     * */
    this.isValid = function () {
      var date = new Date();
      var validTo = new Date(this.getValidTo());

      return date < validTo;
    };

    /**@public
     * @description Метод возвращает идентификатор сертификата:
     * - для PKCS#11 - это атрибут CKA_ID;
     * - для CAPI - это параметр pszContainer.
     * */
    this.getId = function () {
      return IFCConst.emptyString(info['id']);
    };

    /**@public
     * @description Метод возвращает идентификатор контейнера (containerId), в котором содержится сертификат
     * */
    this.getContainerId = function () {
      return crypto.getCryptoId() + "/" + IFCConst.emptyString(info["id"]);
    };

    /**@public
     * @description Метод возвращает идентификатор СКЗИ (cryptoId), содержащего контейнер с сертификатом
     * */
    this.getCryptoId = function () {
      return crypto.getCryptoId();
    };

    /**@public
     * @description Метод возвращает булево выражение - получен ли сертификат через программный интерфейс PKCS#11
     * */
    this.isPKCS11 = function () {
      return crypto.isPKCS11();
    };

    /**@public
     * @description Метод возвращает булево выражение: получен ли сертификат через программный интерфейс CAPI
     * */
    this.isCAPI = function () {
      return crypto.isCAPI();
    };

    /**@public
     * @description Метод возвращает булево выражение: получен ли сертификат через программный интерфейс CAPI_LINUX
     * */
    this.isCAPI_LINUX = function () {
      return crypto.isCAPI_LINUX();
    };

    this.checkDate = function (date) {
      if (isNaN(new Date(date).getTime())) {
        return date.replace(/([a-z]*\s\d{1,2}\s)((?:\d{2}:?){3})\s(\d{4}\s)(.*)/i, '$1$3$2$4');
      }

      return date;
    }
  }

  /**
   * @class IFCCertificateInfo
   * @description Содержит подробную информацию о сертификате ЭП. Позволяет получить сертификат в форматах Base64 и PEM.
   */
  window.IFCCertificateInfo = function (info) {

    /**@public
     * @description Метод возвращает серийный номер сертификата
     * */
    this.getSerialNumber = function () {
      return IFCConst.emptyString(info['cert_sn']);
    };

    /**@public
     * @description Метод возвращает сведения о субъекте сертификата
     * */
    this.getSubjectDN = function () {
      return new IFCDN(IFCConst.emptyString(info['cert_subject']), IFCConst.DN_SEPARATOR_PLUGIN);
    };

    /**@public
     * @description Метод возвращает сведения об издателе сертификата
     * */
    this.getIssuerDN = function () {
      return new IFCDN(IFCConst.emptyString(info['cert_issuer']), IFCConst.DN_SEPARATOR_PLUGIN);
    };

    /**@public
     * @description Метод возвращает срок начала действия сертификата
     * */
    this.getValidFrom = function () {
      return IFCConst.emptyString(this.checkDate(info['cert_valid_from']));
    };

    /**@public
     * @description Метод возвращает срок окончания действия сертификата
     * */
    this.getValidTo = function () {
      return IFCConst.emptyString(this.checkDate(info['cert_valid_to']));
    };

    /**@public
     * @description Метод возвращает алгоритм подписи и хеширования в виде uri
     * */
    this.getSignAndDigestAlgUri = function () {

      var algOid = this.getSignAlgOid();

      if (algOid === IFCConst.OID_GOSTR3410_2012_256) {
        return {
          signMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr34102001-gostr3411",
          digestMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr3411"
        }
      } else if (algOid === IFCConst.OID_GOSTR3410_2012_512) {
        return {
          signMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr34102001-gostr3411",
          digestMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr3411"
        }
      } else if (algOid === IFCConst.OID_GOSTR3410_2001) {
        return {
          signMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr34102001-gostr3411",
          digestMethod: "http://www.w3.org/2001/04/xmldsig-more#gostr3411"
        }
      } else {
        return {
          signMethod: "",
          digestMethod: ""
        }
      }
    };

    /**@public
     * @description Метод возвращает алгоритм подписи
     * */
    this.getSignAlg = function () {

      var algOid = this.getSignAlgOid();
      var algString;

      if (algOid === IFCConst.OID_GOSTR3410_2001) {
        algString = "gost_2001";
      } else if (algOid === IFCConst.OID_GOSTR3410_2012_256) {
        algString = "gost_2012_256";
      } else if (algOid === IFCConst.OID_GOSTR3410_2012_512) {
        algString = "gost_2012_512";
      } else {
        algString = "";
      }

      return algString;
    };

    /**@public
     * @description Метод возвращает oid алгоритма подписи
     * */
    this.getSignAlgOid = function () {
      return IFCConst.emptyString(info['cert_sign_alg']);
    };

    /**@public
     * @description Метод возвращает булево выражение: действителен ли сертификат на настоящий момент.
     * Проверка осуществляется сравнением текущего времени на ПК исполнения JavaScript-сценария
     * со значением IFCCertificate.getValidTo.
     * */
    this.isValid = function () {
      var date = new Date();
      var validTo = new Date(this.getValidTo());

      return date < validTo;
    };

    /**@public
     * @description Метод возвращает сертификат, кодированный в Base64
     * */
    this.getBase64 = function () {
      return IFCConst.emptyString(info['base64']);
    };

    /**@public
     * @description Метод возвращает сертификат, кодированный в формате PEM
     * */
    this.getPem = function () {
      return IFCConst.emptyString(info['pem']);
    };

    /**@public
     * @description Метод возвращает версию сертификата
     * */
    this.getVersion = function () {
      return IFCConst.emptyString(info['version']);
    };

    /**@public
     * @description Метод возвращает расширения сертификата в текстовом виде
     * */
    this.getExtensionsString = function () {
      return IFCConst.emptyString(info['extensions']);
    };

    /**@public
     * @description Возвращает сертификат ЭП в виде текста.
     * @returns {String} Строка, содержащая текстовое представление сертификата (переносы строк и символы табуляции).
     * */
    this.getPrintableText = function () {
      return this.getPrintable("\n", "\t", ", ");
    };

    /**@public
     * @description Возвращает сертификат ЭП в виде текста с html-разметкой.
     * @returns {String} Строка, содержащая текстовое представление сертификата (br и nbsp).
     * */
    this.getPrintableHTML = function () {
      return this.getPrintable("<br />", "&nbsp;&nbsp;", ", ");
    };

    /**@private*/
    this.getPrintable = function (cr, tab, sep) {
      if (!cr) {
        cr = "\n";
      }

      if (!tab) {
        tab = "\t";
      }

      if (!sep) {
        sep = ", ";
      }

      var certPrintable = "Номер квалифицированного сертификата: " + this.getSerialNumber() + cr +
        "Действие квалифицированного сертификата:" + cr +
        tab + tab + "с " + this.getValidFrom() + cr +
        tab + tab + "по " + this.getValidTo() + cr +
        cr +
        tab + "Сведения о владельце квалифицированного сертификата" + cr +
        cr +
        "Фамилия, имя, отчество: " + this.getSubjectDN().getCommonName() + cr +
        "Страховой номер индивидуального лицевого счета: " + this.getSubjectDN().getSNILS() + cr +
        cr +
        tab + "Сведения об издателе квалифицированного сертификата" + cr +
        cr +
        "Наименование  удостоверяющего  центра: " + this.getIssuerDN().getCommonName() + cr +
        "Место  нахождения  удостоверяющего центра: " + this.getIssuerDN().getCountryName() + sep +
        this.getIssuerDN().getStateOrProvinceName() + sep + this.getIssuerDN().getLocalityName() + sep +
        this.getIssuerDN().getStreetAddress() + cr;

      // Optional information in issuerDN
      if (this.getIssuerDN().getSurname()) {
        certPrintable += "Доверенное лицо удостоверяющего центра: " + this.getIssuerDN().getSurname();
      } else if (this.getIssuerDN().getGivenName()) {
        certPrintable += sep + this.getIssuerDN().getGivenName() + cr;
      } else {
        certPrintable += cr;
      }

      //TODO Extensions has to be parsed as other elements
      certPrintable += tab + "Расширения сертификата" + cr + cr +
        this.getExtensionsString().replace(/(\r\n|\n|\r)/gm, cr).replace(/^\s+/mg, tab);

      return certPrintable;
    };

    this.checkDate = function (date) {
      if (isNaN(new Date(date).getTime())) {
        return date.replace(/([a-z]*\s\d{1,2}\s)((?:\d{2}:?){3})\s(\d{4}\s)(.*)/i, '$1$3$2$4');
      }

      return date;
    }
  }

  /**
   * @class IFCDN
   * @description Содержит подробную информацию о субъекте и издателе сертификата ЭП: позволяет получить доступ
   * к данным уникального имени субъекта и издателя (DN — англ. Distinguished Name).
   *
   */
  window.IFCDN = function (dnString, dnSeparator) {
    /**@private*/
    var getNumericOid = function (oid) {
      switch (oid.toLowerCase()) {
        case "commonname":
        case "cn":
          return IFCConst.OID_COMMON_NAME;
        case "surname":
          return IFCConst.OID_SURNAME;
        case "givenname":
          return IFCConst.OID_GIVEN_NAME;
        case "countryname":
        case "c":
          return IFCConst.OID_COUNTRY_NAME;
        case "stateorprovincename":
          return IFCConst.OID_STATE_OR_PROVINCE_NAME;
        case "localityname":
        case "l":
          return IFCConst.OID_LOCALITY_NAME;
        case "streetaddress":
        case "street":
          return IFCConst.OID_STREET_ADDRESS;
        case "organizationname":
        case "o":
          return IFCConst.OID_ORGANIZATION_NAME;
        case "organizationunitname":
        case "ou":
          return IFCConst.OID_ORGANIZATION_UNIT_NAME;
        case "title":
          return IFCConst.OID_TITLE;
        case "emailaddress":
        case "email":
          return IFCConst.OID_EMAIL_ADDRESS;
        case "ogrn":
          return IFCConst.OID_OGRN;
        case "snils":
          return IFCConst.OID_SNILS;
        case "inn":
          return IFCConst.OID_INN;
        default:
          return oid;
      }
    };

    var dnArray = dnString.split("\\,").join("[escaped_comma]").split(dnSeparator);
    this.dnData = new Object();

    for (var i = 0; i < dnArray.length; i++) {
      var oidValue = dnArray[i].split("=");

      if (oidValue[1] == null) {
        oidValue[1] = "";
      }

      var oid = oidValue[0].trim();
      var value = oidValue[1].trim().split("[escaped_comma]").join(",");

      this.dnData[getNumericOid(oid)] = value;
    }

    /**@public
     * @description Метод возвращает значение OID "commonName": наименование субъекта (ФИО или наименование организации)
     * */
    this.getCommonName = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_COMMON_NAME]);
    };

    /**@public
     * @description Метод возвращает значение OID "surname": фамилия
     * */
    this.getSurname = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_SURNAME]);
    };

    /**@public
     * @description Метод возвращает значение OID "givenName": имя и отчество
     * */
    this.getGivenName = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_GIVEN_NAME]);
    };

    /**@public
     * @description Метод возвращает значение OID "countryName": страна
     * */
    this.getCountryName = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_COUNTRY_NAME]);
    };

    /**@public
     * @description Метод возвращает значение OID "stateOrProvinceName": регион
     * */
    this.getStateOrProvinceName = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_STATE_OR_PROVINCE_NAME]);
    };

    /**@public
     * @description Метод возвращает значение OID "localityName": наименование населенного пункта
     * */
    this.getLocalityName = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_LOCALITY_NAME]);
    };

    /**@public
     * @description Метод возвращает значение OID "streetAddress": адрес
     * */
    this.getStreetAddress = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_STREET_ADDRESS]);
    };

    /**@public
     * @description Метод возвращает значение OID "organizationName": наименование организации
     * */
    this.getOrganizationName = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_ORGANIZATION_NAME]);
    };

    /**@public
     * @description Метод возвращает значение OID "organizationUnitName": наименование подразделения организации
     * */
    this.getOrganizationUnitName = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_ORGANIZATION_UNIT_NAME]);
    };

    /**@public
     * @description Метод возвращает значение OID "Title": должность
     * */
    this.getTitle = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_TITLE]);
    };

    /**@public
     * @description Метод возвращает значение OID "emailAddress": адрес электронной почты
     * */
    this.getEmailAddress = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_EMAIL_ADDRESS]);
    };

    /**@public
     * @description Метод возвращает значение OID "OGRN": ОГРН
     * */
    this.getOGRN = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_OGRN]);
    };

    /**@public
     * @description Метод возвращает значение OID "SNILS": СНИЛС
     * */
    this.getSNILS = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_SNILS]);
    };

    /**@public
     * @description Метод возвращает значение OID "INN": ИНН
     * */
    this.getINN = function () {
      return IFCConst.emptyString(this.dnData[IFCConst.OID_INN]);
    };


    /**@public
     * @description Метод возвращает значение произвольного OID из объекта IFCDN
     * */
    this.getValueByOid = function (oid) {
      return IFCConst.emptyString(this.dnData[getNumericOid(oid)]);
    };

    /**@private*/
    this.getSubjectArray = function () {
      //var dnArray = new Array();
      var dnArray = new Object();

      var oidsCount = 0;

      for (var dnKey in this.dnData) {
        oidsCount++;

        //dnArray.push({"oid": dnKey, "oid_type": IFCConst.getDNDataType(dnKey), "value": this.dnData[dnKey]});

        dnArray["oid_" + oidsCount] = dnKey;
        dnArray["oid_type_" + oidsCount] = IFCConst.getDNDataType(dnKey);
        dnArray["value_" + oidsCount] = this.dnData[dnKey];
      }

      dnArray["oids_count"] = oidsCount;

      return dnArray;
    };

    /**@public
     * @description Метод возвращает данные объекта IFCDN (Distinguished Name - отличительное имя) одной строкой
     * */
    this.getOneLine = function () {
      var Line = "";

      if (this.getCountryName())
        Line += "c=" + this.getCountryName() + ", ";

      if (this.getStateOrProvinceName())
        Line += "stateorprovincename=" + this.getStateOrProvinceName() + ", ";

      if (this.getLocalityName())
        Line += "l=" + this.getLocalityName() + ", ";

      if (this.getCommonName())
        Line += "cn=" + this.getCommonName() + ", ";

      if (this.getSurname())
        Line += "surname=" + this.getSurname() + ", ";

      if (this.getGivenName())
        Line += "givenname=" + this.getGivenName() + ", ";

      if (this.getStreetAddress())
        Line += "street=" + this.getStreetAddress() + ", ";

      if (this.getOrganizationName())
        Line += "o=" + this.getOrganizationName() + ", ";

      if (this.getOrganizationUnitName())
        Line += "ou=" + this.getOrganizationUnitName() + ", ";

      if (this.getTitle())
        Line += "title=" + this.getTitle() + ", ";

      if (this.getEmailAddress())
        Line += "email=" + this.getEmailAddress() + ", ";

      if (this.getOGRN())
        Line += "ogrn=" + this.getOGRN() + ", ";

      if (this.getSNILS())
        Line += "snils=" + this.getSNILS() + ", ";

      if (this.getINN())
        Line += "inn=" + this.getINN() + ", ";

      Line = Line.substring(0, Line.length - 2);
      return Line;
    }

  }

  /**
   * @class IFCCertificateRequest
   * @description Содержит значение запроса на выпуск сертификата (CSR).
   */
  window.IFCCertificateRequest = function (containerId, csr) {

    /**@public
     * @description Метод возвращает идентификатор контейнера, в котором содержится ключевая пара,
     * для которой создан CSR.
     * */
    this.getContainerId = function () {
      return containerId;
    };

    /**@public
     * @description Метод возвращает запрос на выпуск сертификата, кодированный в Base64
     * */
    this.getCsr = function () {
      return csr;
    }
  }

  /**
   * @class IFCEncrypted
   * @description Объект содержит криптотекст, зашифрованный сессионный ключ, сертификат отправителя.
   */
  window.IFCEncrypted = function (encryptedData, encryptedKey, certificate) {

    /**@public
     * @description Метод возвращает зашифрованные данные, кодированные в Base64
     * */
    this.getData = function () {
      return encryptedData;
    };

    /**@public
     * @description Метод возвращает зашифрованный сессионный ключ, кодированный в Base64
     * */
    this.getKey = function () {
      return encryptedKey;
    };

    /**@public
     * @description Метод возвращает сертификат отправителя зашифрованного сообщения, кодированный в Base64
     * */
    this.getCertificate = function () {
      return certificate;
    }
  }

  /**
   * @class IFCHash
   * @description Содержит вычисленное значение хеш-функции
   */
  window.IFCHash = function (hashBase64) {

    /**@public
     * @description Метод возвращает значение хеш-функции, кодированное в Base64
     * */
    this.getBase64 = function () {
      return hashBase64;
    };

    /**@public
     * @description Метод возвращает значение хеш-функции, декодированное из Base64
     * В формате "0xFF0xFF0xFF". Прямой порядок байт
     * */
    this.getHexBinary = function () {
      return binStringToHex(decodeBase64(hashBase64));
    };

    /**@public
     * @description Метод возвращает значение хеш-функции, декодированное из Base64. Прямой порядок байт
     * */
    this.getPlainData = function () {
      return decodeBase64(hashBase64);
    };

    // private methods

    /**@private*/
    var decodeBase64 = function (s) {
      var e = {}, i, k, v = [], r = '', w = String.fromCharCode;
      var n = [
        [65, 91],
        [97, 123],
        [48, 58],
        [43, 44],
        [47, 48]
      ];

      for (z in n) {
        for (i = n[z][0]; i < n[z][1]; i++) {
          v.push(w(i));
        }
      }
      for (i = 0; i < 64; i++) {
        e[v[i]] = i;
      }

      for (i = 0; i < s.length; i += 72) {
        var b = 0, c, x, l = 0, o = s.substring(i, i + 72);
        for (x = 0; x < o.length; x++) {
          c = e[o.charAt(x)];
          b = (b << 6) + c;
          l += 6;
          while (l >= 8) {
            r += w((b >>> (l -= 8)) % 256);
          }
        }
      }
      return r;
    };

    /**@private*/
    var binStringToHex = function (s) {
      var s2 = [], c;
      var result = "";
      for (var i = 0, l = s.length; i < l; ++i) {
        c = s.charCodeAt(i);
        s2.push(
          (c >> 4).toString(16),
          (c & 0xF).toString(16));
      }
      String.prototype.concat.apply('', s2);

      for (var i = 0; i < s2.length; i++) {
        result += s2[i];
      }

      return result;
    }
    // end of private methods
  }

  /**
   * @class IFCConst
   * @description Содержит константы конфигурации для вызова функций плагина.
   * @private
   */
  window.IFCConst = {
    // Input data types
    IFC_DATATYPE_DATA: 1,
    IFC_DATATYPE_DATA_BASE64: 2,
    IFC_DATATYPE_HASH: 3,
    IFC_DATATYPE_HASH_BASE64: 4,
    IFC_DATATYPE_FILENAME: 5,

    // CryptoAPI Definitions
    IFC_CRYPTO_PKCS11: "pkcs11",
    IFC_CRYPTO_CAPI: "capi",
    IFC_CRYPTO_CAPI_LINUX: "capi_linux",


    // SubjectDN OID definitions
    OID_COMMON_NAME: "2.5.4.3",
    OID_SURNAME: "2.5.4.4",
    OID_GIVEN_NAME: "2.5.4.42",
    OID_COUNTRY_NAME: "2.5.4.6",
    OID_STATE_OR_PROVINCE_NAME: "2.5.4.8",
    OID_LOCALITY_NAME: "2.5.4.7",
    OID_STREET_ADDRESS: "2.5.4.9",
    OID_ORGANIZATION_NAME: "2.5.4.10",
    OID_ORGANIZATION_UNIT_NAME: "2.5.4.11",
    OID_TITLE: "2.5.4.12",
    OID_EMAIL_ADDRESS: "1.2.840.113549.1.9.1",

    // Russian custom SubjectDN OID definitions
    OID_OGRN: "1.2.643.100.1",
    OID_SNILS: "1.2.643.100.3",
    OID_INN: "1.2.643.3.131.1.1",

    // Certificate Policies OID definitions
    OID_KC1: "1.2.643.100.113.1",
    OID_KC2: "1.2.643.100.113.2",
    OID_KC3: "1.2.643.100.113.3",

    // Signature Algorithm OID definitions
    OID_GOSTR3410_2001: "1.2.643.2.2.19",
    OID_GOSTR3410_2012_256: "1.2.643.7.1.1.1.1",
    OID_GOSTR3410_2012_512: "1.2.643.7.1.1.1.2",

    // DN definitions
    DN_SEPARATOR_PLUGIN: "\n",
    DN_SEPARATOR_INPUT: ",",

    // Certificate retrieval types
    IFC_CERT_LOAD_FROM_CONTAINER: 1,
    IFC_CERT_LOAD_FROM_FILE: 2,
    IFC_CERT_LOAD_FROM_STRING: 3,

    // Signature types
    IFC_SIGNTYPE_SIMPLE: 1,
    IFC_SIGNTYPE_SIMPLE_REVERSE: 2,
    IFC_SIGNTYPE_CMS_ATTACHED: 3,
    IFC_SIGNTYPE_CMS_DETACHED: 4,
    IFC_SIGNTYPE_CADES_BES_ATTACHED: 5,
    IFC_SIGNTYPE_CADES_BES_DETACHED: 6,

    // Hashing type for PKCS#11
    IFC_HARDWARE_HASH: 1,
    IFC_SOFTWARE_HASH: 2,

    // Output format
    IFC_BASE64: 1,
    IFC_RAW: 0,

    //Show or hide ui csp during signing
    IFC_SHOW_CSP_UI: 1,
    IFC_HIDE_CSP_UI: 0,

    // Certificate info types
    IFC_X509_INFO_CERT_BASE64ENCODED: 1,
    IFC_X509_INFO_CERT_DER: 2,
    IFC_X509_INFO_CERT_VERSION: 3,
    IFC_X509_INFO_CERT_SERIALNUMBER: 4,
    IFC_X509_INFO_CERT_SUBJECT: 5,
    IFC_X509_INFO_CERT_ISSUER: 6,
    IFC_X509_INFO_CERT_VALIDFROM: 7,
    IFC_X509_INFO_CERT_VALIDTO: 8,
    IFC_X509_INFO_CERT_X509EXTENSIONS: 9,
    IFC_X509_INFO_CERT_PEM: 10,
    IFC_X509_INFO_CERT_ALG: 11,

    // Certificate data types
    IFC_CERT_UNKNOWN: 0,
    IFC_CERT_DER: 1,
    IFC_CERT_BASE64: 2,
    IFC_CERT_PEM: 3,

    // Certificare Request types
    IFC_REQ_DER: 0,
    IFC_REQ_PEM: 1,
    IFC_REQ_BASE64ENCODED: 2,

    // P11 PIN Types
    P11_PIN_TYPE_USER: 0,
    P11_PIN_TYPE_ADMIN: 1,

    // ASN.1 Object types
    IFC_PRINTABLE_STRING: 19,
    IFC_IA5STRING: 22,
    IFC_NUMERICSTRING: 18,
    IFC_UTF8STRING: 12,
    IFC_OCTET_STRING: 4,
    IFC_BMPSTRING: 30,

    // APDU input formats
    APDU_FORMAT_RAW: 0,
    APDU_FORMAT_TEXT: 1,

    // Visualization methods
    SHOW_SAFETOUCH: 0,

    /**@private*/
    getDNDataType: function (oidName) {
      var dataTypeValue;

      switch (oidName) {
        case this.OID_COUNTRY_NAME:
          dataTypeValue = this.IFC_PRINTABLE_STRING;
          break;
        case this.OID_SNILS:
        case this.OID_OGRN:
        case this.OID_INN:
          dataTypeValue = this.IFC_NUMERICSTRING;
          break;
        case this.OID_EMAIL_ADDRESS:
          dataTypeValue = this.IFC_IA5STRING;
          break;
        default:
          dataTypeValue = IFCConst.IFC_UTF8STRING;
          break;
      }

      return dataTypeValue;
    },

    /**@private*/
    emptyString: function (str) {
      if (str === undefined || str === null) {
        return "";
      }

      return str;
    }
  };

  /**
   * @class IFCError
   * @description Содержит константы кодов ошибок, возвращаемых плагином и библиотекой.
   */
  window.IFCError = {
    // Plugin Errors
    IFC_GENERAL_ERROR: -1,
    IFC_OK: 0x0000,
    IFC_ERROR_UNKNOWN: 0x0001,
    IFC_ERROR_CONFIG: 0x0002,
    IFC_ERROR_RECORD_MAX: 0x0003,
    IFC_ERROR_CONFIG_EMPTY: 0x0004,
    IFC_BAD_PARAMS: 0x0005,
    IFC_ERROR_MALLOC: 0x0006,
    IFC_ALIAS_NOT_FOUND: 0x0007,
    IFC_ERROR_STORE: 0x0008,
    IFC_CERT_NOT_FOUND: 0x0009,
    IFC_CONTAINER_NOT_FOUND: 0x000A,
    IFC_UNSUPPORTED_FORMAT: 0x000B,
    IFC_KEY_NOT_FOUND: 0x000C,
    IFC_BAD_IN_TYPE: 0x000D,
    IFC_BAD_SIGN_TYPE: 0x000E,
    IFC_BAD_HASH_CONTEXT: 0x000F,
    IFC_BAD_TYPE_PIN: 0x0010,
    IFC_NOT_SUPPORTED: 0x0011,
    IFC_SLOT_NOT_INIT: 0x0012,
    IFC_ERROR_VERIFY: 0x0013,
    IFC_ERROR_BASE64: 0x0014,
    IFC_SC_ERROR: 0x0015,
    IFC_ENGINE_ERROR: 0x0016,
    IFC_P11_ERROR: 0x0017,
    IFC_P11_NO_TOKENS_FOUND: 0x0019,
    IFC_PARSE_XML_ERROR: 0x001A,
    IFC_XPATH_ERROR: 0x001B,
    IFC_CANON_XML_ERROR: 0x001C,
    IFC_P11_LOGIN_ERROR: 0x00A0, // Equals to CKR_PIN_INCORRECT
    IFC_UNICODE_ERROR: 0x00A1,
    IFC_ENCODINGS_ERROR: 0x00A2,
    IFC_INIT_ERROR: 0x00A3,
    IFC_CRYPTO_NOT_FOUND: 0x00A4,

    // Library errors
    IFC_PLUGIN_UNDEFINED_ERROR: 0x0100,
    IFC_P11_INVALID_PIN_ERROR: 0x0101,

    getErrorDescription: function (error_code) {
      switch (error_code) {
        // Plugin errors
        case IFCError.IFC_GENERAL_ERROR:
          return "Общая ошибка";
        case IFCError.IFC_OK:
          return "Операция завершена успешно";
        case IFCError.IFC_ERROR_UNKNOWN:
          return "Ошибка не определена";
        case IFCError.IFC_ERROR_CONFIG:
          return "Ошибка конфигурации";
        case IFCError.IFC_ERROR_RECORD_MAX:
          return "Достигнуто максимальное количество записей конфигурации";
        case IFCError.IFC_ERROR_CONFIG_EMPTY:
          return "Конфигурация не опеределена";
        case IFCError.IFC_BAD_PARAMS:
          return "Параметры заданы неверно";
        case IFCError.IFC_ERROR_MALLOC:
          return "Ошибка выделения памяти";
        case IFCError.IFC_ALIAS_NOT_FOUND:
          return "Указанный поставщик криптографии не найден";
        case IFCError.IFC_ERROR_STORE:
          return "Ошибка работы с хранилищем";
        case IFCError.IFC_CERT_NOT_FOUND:
          return "Сертификат не найден";
        case IFCError.IFC_CONTAINER_NOT_FOUND:
          return "Ключевой контейнер не найден";
        case IFCError.IFC_UNSUPPORTED_FORMAT:
          return "Формат не поддерживается";
        case IFCError.IFC_KEY_NOT_FOUND:
          return "Ключ не найден";
        case IFCError.IFC_BAD_IN_TYPE:
          return "Тип входных данных задан неверно";
        case IFCError.IFC_BAD_SIGN_TYPE:
          return "Тип электронной подписи задан неверно";
        case IFCError.IFC_BAD_HASH_CONTEXT:
          return "Контекст хеширования не найден";
        case IFCError.IFC_BAD_TYPE_PIN:
          return "Тип пин-кода задан неверно";
        case IFCError.IFC_NOT_SUPPORTED:
          return "Операция не поддерживается";
        case IFCError.IFC_SLOT_NOT_INIT:
          return "Слот не инициализирован";
        case IFCError.IFC_ERROR_VERIFY:
          return "Ошибка проверки подписи";
        case IFCError.IFC_ERROR_BASE64:
          return "Ошибка кодировки BASE64";
        case IFCError.IFC_SC_ERROR:
          return "Ошибка подсистемы смарт-карт";
        case IFCError.IFC_ENGINE_ERROR:
          return "Ошибка работы с библиотеки интерфейса";
        case IFCError.IFC_P11_ERROR:
          return "Ошибка работы с библиотекой PKCS#11";
        case IFCError.IFC_P11_NO_TOKENS_FOUND:
          return "Смарт-карта не найдена";
        case IFCError.IFC_PARSE_XML_ERROR:
          return "Ошибка парсинга XML";
        case IFCError.IFC_XPATH_ERROR:
          return "Ошибка выполнения XPath";
        case IFCError.IFC_CANON_XML_ERROR:
          return "Ошибка канонизации XML";
        case IFCError.IFC_P11_LOGIN_ERROR:
          return "Неверный пин-код";
        case IFCError.IFC_UNICODE_ERROR:
          return "Ошибка работы с UNICODE";
        case IFCError.IFC_ENCODINGS_ERROR:
          return "Ошибка кодировки";
        case IFCError.IFC_INIT_ERROR:
          return "Ошибка инициализации плагина";
        case IFCError.IFC_CRYPTO_NOT_FOUND:
          return "СКЗИ не найдено";

        // Library errors
        case IFCError.IFC_PLUGIN_UNDEFINED_ERROR:
          return "Ошибка инициализации объекта плагина";
        case IFCError.IFC_P11_INVALID_PIN_ERROR:
          return "Пин-код не соответствует требованиям";



        // default
        default:
          return "Неизвестная ошибка";
      }
    }
  };

// trim fix

  /** trim fix
   * @private */
  if (typeof String.prototype.trim !== 'function') {
    /**@private*/
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, '');
    }
  }
})(window);

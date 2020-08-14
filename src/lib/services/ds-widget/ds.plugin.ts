import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DsPlugin {

  private instance;

  constructor() {
    // if (!this.instance) this.init();
  }

  private static dateToStr(s): Date {
    const tokens = s.split(' ');
    const date = [];
    for (const n in tokens) {
      if (tokens[n] && tokens[n] !== ' ') {
        date.push(tokens[n]);
      }
    }
    return new Date(date[0] + ' ' + date[1] + ' ' + date[3] + ' ' + date[2] + ' ' + date[4]);
  }

  private static dateFormat(date: Date): string {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return (day > 9 ? day : '0' + day) + '.' + (month > 9 ? month : '0' + month) + '.' + year;
  }

  private static cspId(cspInfo: any): any {
    const alias = 'alias';
    const type = 'type';
    const num = 'num';
    const cryptoId = 'crypto_id';
    switch (cspInfo[type]) {
      case 'capi':
        return cspInfo[alias];
      case 'pkcs11':
        return cspInfo[alias] + '/' + cspInfo[num];
      default:
        return cspInfo[cryptoId];
    }
  }

  private static parseDn(dn): any {
    const valueMap = {};
    const items = dn.split('\n');
    for (const item of items) {
      const itemArr = item.split('=');
      valueMap[itemArr[0].trim().toLocaleLowerCase()] = itemArr[1].trim();
    }
    return valueMap;
  }

  public static getCryptoIdByContainerId(containerId: string): any {
    if (containerId.indexOf('CryptoPro') >= 0 || containerId.indexOf('VIPNet') >= 0) {
      return containerId.substring(0, containerId.indexOf('/'));
    } else {
      return containerId.substring(0, containerId.lastIndexOf('/'));
    }
  }

  private static removeIfc(id: string): void {
    const pluginNode = document.getElementById(id);
    if (typeof pluginNode === 'object' && pluginNode.parentNode) {
      pluginNode.parentNode.removeChild(pluginNode);
    } else if (pluginNode) {
      document.body.removeChild(pluginNode);
    }
  }

  public version(): string {
    if (!this.instance) {
      this.init();
    }
    return this.instance.version;
  }

  public init() {
    const id = 'ifcplugin';
    const dsPluginObjectInstance: any = document.createElement('object');
    dsPluginObjectInstance.setAttribute('id', id);
    dsPluginObjectInstance.setAttribute('type', 'application/x-ifcplugin');
    dsPluginObjectInstance.setAttribute('height', '1');
    dsPluginObjectInstance.setAttribute('width', '1');
    document.body.appendChild(dsPluginObjectInstance);

    if (dsPluginObjectInstance.valid &&
        (typeof dsPluginObjectInstance.create === 'function' || typeof dsPluginObjectInstance.create === 'object')) {
      if (dsPluginObjectInstance.create() === 0) {
        this.instance = dsPluginObjectInstance;
      } else {
        DsPlugin.removeIfc(id);
        throw new Error('ds_plugin_internal');
      }
    } else {
      DsPlugin.removeIfc(id);
      throw new Error('ds_plugin_not_found');
    }
  }

  private crtString(id: number): any {
    const info = 'info';
    const infoArr = [];
    this.instance.info_x509(this.instance.load_x509_from_container(id), 1, infoArr);
    if (this.instance.get_last_error() !== 0) {
      throw new Error('ds_plugin_internal');
    }
    return info[info];
  }

  private parseCrt(crtInfo, cspInfo): any {
    const id = 'id';
    const certSubject = 'cert_subject';
    const certIssuer = 'cert_issuer';
    const serialNumber = 'serial_number';
    const certSn = 'cert_sn';
    const validity = 'validity';
    const stringStr = 'string';
    const type = 'type';
    const sort = 'sort';
    const filter = 'filter';
    const cspType = 'csp_type';
    const cn = 'cn';
    const sn = 'sn';
    const gn = 'gn';
    const from = 'from';
    const to = 'to';
    const subject = 'subject';
    const certValidFrom = 'cert_valid_from';
    const certValidTo = 'cert_valid_to';
    const issuer = 'issuer';
    const commonName = 'common_name';
    const commonNameMap = 'commonname';
    const surname = 'surname';
    const givenName = 'givenname';
    const crt: any = {validity: {}, issuer: {}, subject: {}, sort: {}, filter: {}};
    const subjectMap = DsPlugin.parseDn(crtInfo[certSubject]);
    const issuerMap = DsPlugin.parseDn(crtInfo[certIssuer]);

    crt[id] = DsPlugin.cspId(cspInfo) + '/' + crtInfo[id];
    crt[serialNumber] = crtInfo[certSn];
    crt[validity][from] = DsPlugin.dateFormat(DsPlugin.dateToStr(crtInfo[certValidFrom]));
    crt[validity][to] = DsPlugin.dateFormat(DsPlugin.dateToStr(crtInfo[certValidTo]));
    crt[issuer][commonName] = issuerMap[commonNameMap] !== undefined ? issuerMap[commonNameMap] : issuerMap[cn];
    crt[subject][commonName] = subjectMap[commonNameMap] !== undefined ? subjectMap[commonNameMap] : subjectMap[cn];
    crt[subject][sn] = subjectMap[surname] !== undefined && subjectMap[surname] !== null ? subjectMap[surname] : '';
    crt[subject][gn] = subjectMap[givenName] !== undefined && subjectMap[givenName] !== null ? subjectMap[givenName] : '';
    crt[stringStr] = this.crtString(crt.id);
    crt[type] = crt[subject][sn].length > 0 ? 'extended' : 'base';
    crt[sort][from] = DsPlugin.dateToStr(crtInfo[certValidFrom]);
    crt[filter][to] = DsPlugin.dateToStr(crtInfo[certValidTo]);
    crt[filter][cspType] = cspInfo[type];

    if (crt[issuer][commonName] !== undefined && crt[issuer][commonName]) {
      crt[issuer][commonName] = crt[issuer][commonName].replace('_', ' ');
    }
    if (crt[subject][commonName] !== undefined && crt[subject][commonName]) {
      crt[subject][commonName] = crt[subject][commonName].replace('_', ' ');
    }
    const subjSn = crt[subject][sn];
    if (subjSn !== undefined && subjSn) {
      crt[subject][sn] = crt[subject][sn].replace('_', ' ');
    }
    if (crt[subject][gn] !== undefined && crt[subject][gn]) {
      crt[subject][gn] = crt[subject][gn].replace('_', ' ');
    }
    return crt;
  }

  public crts(): any {
    const certificates = [];
    const cspListSize = this.instance.get_list_info_size();
    if (this.instance.get_last_error() !== 0) {
      throw new Error('ds_plugin_internal');
    }

    for (let i = 0; i < cspListSize; i++) {
      const cspInfo = [];
      this.instance.get_list_info(i, cspInfo);
      if (this.instance.get_last_error() !== 0) {
        throw new Error('ds_plugin_internal');
      }

      const crtsLength = this.instance.get_list_certs_size(DsPlugin.cspId(cspInfo));
      if (this.instance.get_last_error() !== 0) {
        throw new Error('ds_plugin_internal');
      }

      for (let j = 0; j < crtsLength; j++) {
        const certificateInfo = [];
        this.instance.get_list_certs(j, certificateInfo);
        if (this.instance.get_last_error() !== 0) {
          throw new Error('ds_plugin_internal');
        }
        certificates.push(this.parseCrt(certificateInfo, cspInfo));
      }
    }
    certificates.sort( (a, b) => {
      return a.sort.from < b.sort.from ? 1 : a.sort.from > b.sort.from ? -1 : 0;
    });
    return certificates.filter(item => {
      return item.filter.to >= new Date();
    });
  }

  public crtInfo(id: number): any {
    const crtsList = this.crts();
    for (const cert of crtsList) {
      if (cert.id === id) {
        return cert;
      }
    }
    throw new Error('ds_plugin_container_not_found');
  }

  public isPinRequired(id: string) {
    const cspId = DsPlugin.getCryptoIdByContainerId(id);
    const cspListSize = this.instance.get_list_info_size();
    if (this.instance.get_last_error() !== 0) {
      throw new Error('ds_plugin_internal');
    }

    for (let i = 0; i < cspListSize; i++) {
      const type = 'type';
      const cspInfo = [];
      this.instance.get_list_info(i, cspInfo);
      if (this.instance.get_last_error() !== 0) {
        throw new Error('ds_plugin_internal');
      }

      if (cspId === DsPlugin.cspId(cspInfo)) {
        return cspInfo[type] === 'pkcs11';
      }
    }
    throw new Error('ds_plugin_container_not_found');
  }

  public sign(id, pin, data): string {
    const signBase64 = 'sign_base64';
    const sign = [];
    this.instance.sign(id, pin, data, 1, 1, 1, 3, sign);
    switch (this.instance.get_last_error()) {
      case 0:
        return sign[signBase64];
      case 1:
        throw  new Error('ds_plugin_process_interrupted');
      case 25:
        throw  new Error('ds_plugin_container_not_found');
      case 160:
        throw  new Error('ds_plugin_bad_pin');
      default:
        throw  new Error('ds_plugin_internal');
    }
  }
}

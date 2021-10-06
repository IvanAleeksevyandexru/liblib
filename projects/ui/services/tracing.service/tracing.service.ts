import { Injectable } from '@angular/core';
import { Tracer, BatchRecorder, jsonEncoder, ExplicitContext } from '@epgu/zipkin';
import { HttpLogger } from 'zipkin-transport-http';
import { LoadService } from '@epgu/ui/services/load';

@Injectable()
export class TracingService {
  private localServiceName = 'form-frontend';
  private tracerZip: Tracer;
  private ctxImpl: ExplicitContext = new ExplicitContext();
  private recorder: BatchRecorder;
  private defaultTags: { [key: string]: string } = {
    serviceCode: '',
  };

  constructor(private loadService: LoadService) {
  }

  public init(): void {
    this.loadService.loaded.subscribe((loaded: boolean) => {
      if (loaded) {
        const tracingParams = {
          isEnabled: this.loadService.config.zipkinSpanSendEnabled,
          endpoint: this.loadService.config.zipkinTracingEndpoint,
          timeout: this.loadService.config.zipkinTracingTimeout,
          maxPayloadSize: this.loadService.config.zipkinMaxPayloadSize,
          isCascadeMode: this.loadService.config.isZipkinCascadeMode
        };

        if (!tracingParams.isEnabled) {
          return;
        }

        this.recorder = new BatchRecorder({
          logger: new HttpLogger({
            endpoint: tracingParams.endpoint, // Required
            jsonEncoder: jsonEncoder.JSON_V2, // JSON encoder to use. Optional (defaults to JSON_V1)
            httpInterval: 1000, // How often to sync spans. Optional (defaults to 1000)
            timeout: tracingParams.timeout || 0, // Timeout for HTTP Post. Optional (defaults to 0)
            maxPayloadSize: tracingParams.maxPayloadSize || 0, // Max payload size for zipkin span. Optional (defaults to 0)
          }),
        });

        this.tracerZip = new Tracer({
          ctxImpl: this.ctxImpl,
          recorder: this.recorder,
          localServiceName: this.localServiceName,
          supportsJoin: true,
          defaultTags: this.defaultTags, // Need to pray that transfer by reference won't be changed to transfer by value
          isCascadeMode: tracingParams.isCascadeMode ?? true,
        });

        this.defaultTags.userId = 'userId';
        this.defaultTags.env = 'env';
      }
    });
  }

  public get tracer(): Tracer {
    return this.tracerZip;
  }

  public set serviceCode(serviceCode: string) {
    this.defaultTags.serviceCode = serviceCode;
  }
}

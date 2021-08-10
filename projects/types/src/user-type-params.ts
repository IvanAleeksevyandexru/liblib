export class UserTypeParams {
  public catalogType: 'EMPLOYEE' | 'BUSINESSMAN' | 'PARTNERS' | '';
  public departmentsType: 'EMPLOYEE' | 'BUSINESSMAN' | 'FOREIGNER' | 'PARTNERS' | '';
  public departmentItem: 'LEGAL' | 'SOLE_PROPRIETOR' | 'PARTNERS' | 'PERSON' | '';
  public occasionType: 'LEGAL' | 'BUSINESSMAN' | 'PARTNERS' | 'PERSON' | '';
  public faqType: 'LEGAL' | 'SOLE_PROPRIETOR' | 'FOREIGN' | 'PARTNERS' | 'PERSON';
  public newsType: 'LEGAL' | 'SOLE_PROPRIETOR' | 'FOREIGN' | 'PERSON' | undefined;
  public rootPath: '/legal-entity' | '/entrepreneur' | '/foreign-citizen' | '/';
  public searchSputnikParam: 'LEGAL' | 'SOLE_PROPRIETOR' | 'FOREIGNER' | 'PARTNERS' | 'all';
  public individual: boolean;
  public name: 'Для юридических лиц' | 'Для предпринимателей' | 'Для иностранных граждан' | 'Для партнеров' | 'Для граждан';
  public userTypeGosBar: 'L' | 'B' | 'F' | 'PA' | 'P';

  constructor(type: string) {
    switch (type) {
      case 'L':
        this.catalogType = 'EMPLOYEE';
        this.departmentsType = 'EMPLOYEE';
        this.departmentItem = 'LEGAL';
        this.occasionType = 'LEGAL';
        this.faqType = 'LEGAL';
        this.newsType = 'LEGAL';
        this.rootPath = '/legal-entity';
        this.searchSputnikParam = 'LEGAL';
        this.individual = false;
        this.name = 'Для юридических лиц';
        this.userTypeGosBar = 'L';
        break;
      case 'B':
        this.catalogType = 'BUSINESSMAN';
        this.departmentsType = 'BUSINESSMAN';
        this.departmentItem = 'SOLE_PROPRIETOR';
        this.occasionType = 'BUSINESSMAN';
        this.faqType = 'SOLE_PROPRIETOR';
        this.newsType = 'SOLE_PROPRIETOR';
        this.rootPath = '/entrepreneur';
        this.searchSputnikParam = 'SOLE_PROPRIETOR';
        this.individual = false;
        this.name = 'Для предпринимателей';
        this.userTypeGosBar = 'B';
        break;
      case 'F':
        this.catalogType = '';
        this.departmentsType = 'FOREIGNER';
        this.departmentItem = '';
        this.occasionType = '';
        this.newsType =  'FOREIGN';
        this.rootPath = '/foreign-citizen';
        this.searchSputnikParam = 'FOREIGNER';
        this.faqType = 'FOREIGN';
        this.individual = false;
        this.name = 'Для иностранных граждан';
        this.userTypeGosBar = 'F';
        break;
      case 'PA':
        this.catalogType = 'PARTNERS';
        this.departmentsType = 'PARTNERS';
        this.departmentItem = 'PARTNERS';
        this.occasionType = 'PARTNERS';
        this.rootPath = '/';
        this.searchSputnikParam = 'PARTNERS';
        this.faqType = 'PARTNERS';
        this.individual = false;
        this.name = 'Для партнеров';
        this.userTypeGosBar = 'PA';
        break;
      case 'P':
      default:
        this.catalogType = '';
        this.departmentsType = '';
        this.departmentItem = 'PERSON';
        this.occasionType = 'PERSON';
        this.faqType = 'PERSON';
        this.newsType = 'PERSON';
        this.rootPath = '/';
        this.searchSputnikParam = 'all';
        this.individual = true;
        this.name = 'Для граждан';
        this.userTypeGosBar = 'P';
        break;
    }
  }
}

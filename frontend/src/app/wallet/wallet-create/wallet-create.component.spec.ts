import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletCreateComponent } from './wallet-create.component';

describe('WalletCreateComponent', () => {
  let component: WalletCreateComponent;
  let fixture: ComponentFixture<WalletCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

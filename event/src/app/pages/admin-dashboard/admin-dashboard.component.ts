import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { EventService } from '../service/event.service';
import { StatsWidget } from '../dashboard/components/statswidget';
import { RevenueStreamWidget } from '../dashboard/components/revenuestreamwidget';
import { NotificationsWidget } from '../dashboard/components/notificationswidget';
import { BestSellingWidget } from '../dashboard/components/bestsellingwidget';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    ChartModule,
    ConfirmDialogModule,
    ToastModule,
    StatsWidget,
    RevenueStreamWidget,
    NotificationsWidget,
    BestSellingWidget
  ],
  templateUrl: './admin-dashboard.component.html',
  providers: [ConfirmationService, MessageService]
})
export class AdminDashboardComponent implements OnInit {
  search = '';
  selectedStatus = '';
  selectedLocation = '';
  selectedMonth = '';
  pendingEvents: any[] = [];

  chartData: any;
  chartOptions: any;

  approvalRateChartData: any;
  approvalRateChartOptions: any;


  constructor(
    private eventService: EventService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}


  generateApprovalRateDonut() {
  const rate = this.approvalRate;
  const remaining = 100 - rate;

  this.approvalRateChartData = {
    labels: ['Taux d\'approbation', 'Autres'],
    datasets: [
      {
        data: [rate, remaining],
        backgroundColor: ['#3B82F6', '#E5E7EB'], // BLEU et GRIS
        hoverBackgroundColor: ['#2563EB', '#D1D5DB'],
        borderWidth: 0
      }
    ]
  };

  this.approvalRateChartOptions = {
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };
}


  ngOnInit() {
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.pendingEvents = data;
        this.calendarOptions.events = this.calendarEvents;
        this.generateChart();
        this.generateApprovalRateDonut();

      },
      error: (err) => {
        console.error('Erreur lors du chargement des événements :', err);
      }
    });
  }

  statusOptions = [
    { label: 'Tous', value: '' },
    { label: 'En attente', value: 'PENDING' },
    { label: 'Approuvé', value: 'VALIDATED' },
    { label: 'Rejeté', value: 'REJECTED' }
  ];

  get locationOptions() {
    const uniqueLocations = Array.from(new Set(this.pendingEvents.map(e => e.location)));
    return [{ label: 'Tous', value: '' }, ...uniqueLocations.map(loc => ({ label: loc, value: loc }))];
  }

  get monthOptions() {
    return [
      { label: 'Tous', value: '' },
      ...Array.from(new Set(this.pendingEvents.map(e => e.eventDate.substring(0, 7))))
        .sort()
        .map(m => ({ label: m, value: m }))
    ];
  }

  get calendarEvents() {
    return this.pendingEvents.map(e => ({
      title: e.title,
      date: e.eventDate,
      color: this.getCalendarColor(e.status),
      extendedProps: {
        location: e.location,
        status: e.status
      }
    }));
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: false,
    eventDisplay: 'block',
    eventDidMount: (info) => {
      const tooltip = document.createElement('div');
      tooltip.innerHTML = `<b>${info.event.title}</b><br>📍 ${info.event.extendedProps['location']}<br>Status: ${info.event.extendedProps['status']}`;
      tooltip.classList.add('fc-tooltip');
      tooltip.style.position = 'absolute';
      tooltip.style.zIndex = '10001';
      tooltip.style.background = '#fff';
      tooltip.style.border = '1px solid #ccc';
      tooltip.style.padding = '8px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
      tooltip.style.display = 'none';
      document.body.appendChild(tooltip);

      info.el.addEventListener('mouseenter', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
        tooltip.style.display = 'block';
      });
      info.el.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    }
  };

  /*
approve(event: any) {
    this.confirmationService.confirm({
      message: `Confirmez-vous l'approbation de "${event.title}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-check',
      accept: () => {
        this.eventService.validateEvent(event.id).subscribe(() => {
          event.status = 'VALIDATED';
          this.calendarOptions.events = this.calendarEvents;
          this.generateChart();
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Événement approuvé' });
        });
      }
    });
  }

  reject(event: any) {
    this.confirmationService.confirm({
      message: `Confirmez-vous le rejet de "${event.title}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-times',
      accept: () => {
        this.eventService.rejectEvent(event.id).subscribe(() => {
          event.status = 'REJECTED';
          this.calendarOptions.events = this.calendarEvents;
          this.generateChart();
          this.messageService.add({ severity: 'warn', summary: 'Succès', detail: 'Événement rejeté' });
        });
      }
    });
  } */

  approve(event: any) {
    this.confirmationService.confirm({
      message: `Confirmez-vous l'approbation de "${event.title}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-check',

      // Inversion pour "Oui" vert à gauche
      acceptLabel: 'Non',
      rejectLabel: 'Oui',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-success',

      // Empêcher fermeture implicite
      closable: false,
      dismissableMask: false,
      defaultFocus: 'reject',

      // Action sur Oui
      reject: () => {
        this.eventService.validateEvent(event.id).subscribe(() => {
          event.status = 'VALIDATED';
          this.calendarOptions.events = this.calendarEvents;
          this.generateChart();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Événement approuvé'
          });
        });
      },

      // Ne rien faire sur Non
      accept: () => {}
    });
  }

  reject(event: any) {
    this.confirmationService.confirm({
      message: `Confirmez-vous le rejet de "${event.title}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-times',

      // Inversion pour "Oui" vert à gauche
      acceptLabel: 'Non',
      rejectLabel: 'Oui',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-success',

      closable: false,
      dismissableMask: false,
      defaultFocus: 'reject',

      // Action sur Oui
      reject: () => {
        this.eventService.rejectEvent(event.id).subscribe(() => {
          event.status = 'REJECTED';
          this.calendarOptions.events = this.calendarEvents;
          this.generateChart();
          this.messageService.add({
            severity: 'warn',
            summary: 'Succès',
            detail: 'Événement rejeté'
          });
        });
      },

      // Ne rien faire sur Non
      accept: () => {}
    });
  }



  getSeverity(status: string): string {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'VALIDATED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'warning';
    }
  }

  getCalendarColor(status: string): string {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'VALIDATED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      default: return '#6366f1';
    }
  }

  filteredEvents() {
    return this.pendingEvents.filter(e => {
      const matchesSearch = this.search === '' || e.title.toLowerCase().includes(this.search.toLowerCase());
      const matchesStatus = this.selectedStatus === '' || e.status === this.selectedStatus;
      const matchesLocation = this.selectedLocation === '' || e.location === this.selectedLocation;
      const matchesMonth = this.selectedMonth === '' || e.eventDate.startsWith(this.selectedMonth);
      return matchesSearch && matchesStatus && matchesLocation && matchesMonth;
    });
  }

  generateChart() {
    const monthMap = new Map<string, number>();
    this.pendingEvents.forEach(e => {
      if (e.status === 'VALIDATED') {
        const month = e.eventDate.substring(0, 7);
        monthMap.set(month, (monthMap.get(month) || 0) + 1);
      }
    });
    const labels = Array.from(monthMap.keys()).sort();
    const data = labels.map(label => monthMap.get(label));

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Événements validés',
          backgroundColor: '#42A5F5',
          data
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: { color: '#374151' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#6B7280' },
          grid: { color: '#E5E7EB' }
        },
        y: {
          ticks: { color: '#6B7280' },
          grid: { color: '#E5E7EB' }
        }
      }
    };
  }

get approvedCount(): number {
  return this.pendingEvents.filter(e => e.status === 'VALIDATED').length;
}

get pendingCount(): number {
  return this.pendingEvents.filter(e => e.status === 'PENDING').length;
}

get approvalRate(): number {
  const total = this.pendingEvents.length;
  return total ? Math.round((this.approvedCount / total) * 100) : 0;
}

get activeOrganizers(): number {
  return new Set(this.pendingEvents.map(e => e.creatorEmail)).size;
}

getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();
}


topOrganizers(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const e of this.pendingEvents) {
    const name = e.creatorFirstName + ' ' + e.creatorLastName;
    map.set(name, (map.get(name) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

}

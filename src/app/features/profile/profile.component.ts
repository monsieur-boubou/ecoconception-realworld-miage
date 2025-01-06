import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { AsyncPipe, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { combineLatest, of, Subject, throwError } from "rxjs";
import { catchError, switchMap, takeUntil } from "rxjs/operators";
import { Profile } from "../../core/models/profile.model";
import { ProfileService } from "../../core/services/profile.service";
import { UserService } from "../../core/services/user.service";
import { FollowButtonComponent } from "../../shared/buttons/follow-button.component";

@Component({
  selector: "app-profile-page",
  templateUrl: "./profile.component.html",
  imports: [
    FollowButtonComponent,
    NgIf,
    RouterLink,
    AsyncPipe,
    RouterLinkActive,
    RouterOutlet,
  ],
  animations: [
    trigger("intensiveAnimation", [
      transition(":enter", [
        animate(
          "10s ease-in-out",
          keyframes([
            style({ opacity: 0, transform: "translateX(-100%)", offset: 0 }),
            style({ opacity: 0.5, transform: "translateX(50%)", offset: 0.5 }),
            style({ opacity: 1, transform: "translateX(0)", offset: 1 }),
          ])
        ),
      ]),
      transition(":leave", [
        animate(
          "10s ease-in-out",
          keyframes([
            style({ opacity: 1, transform: "translateX(0)", offset: 0 }),
            style({ opacity: 0.5, transform: "translateX(-50%)", offset: 0.5 }),
            style({ opacity: 0, transform: "translateX(100%)", offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
  standalone: true,
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile!: Profile;
  isUser: boolean = false;
  destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly profileService: ProfileService
  ) {}

  ngOnInit() {
    this.profileService
      .get(this.route.snapshot.params["username"])
      .pipe(
        catchError((error) => {
          void this.router.navigate(["/"]);
          return throwError(() => error);
        }),
        switchMap((profile) => {
          return combineLatest([of(profile), this.userService.currentUser]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(([profile, user]) => {
        this.profile = profile;
        this.isUser = profile.username === user?.username;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleFollowing(profile: Profile) {
    this.profile = profile;
  }
}

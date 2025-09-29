import { Book } from "@/lib/types";
import { slugify } from "@/lib/utils";

const mk = (id:number,title:string,author:string,price:number,tags:string[],cover:string,description:string): Book => ({
  id: String(id),
  slug: slugify(title) + "-" + id,
  title, author, price, rating: 4 + (id % 2 ? 0.5 : 0), stock: 20 - id, tags, cover, description
});

export const books: Book[] = [
  mk(1,"One Piece Vol. 1 (Romance Dawn)","Eiichiro Oda",9.99,["adventure","shonen","pirates"],
     "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
     "Luffy’s journey to become Pirate King begins."),
  mk(2,"Naruto Vol. 1","Masashi Kishimoto",9.99,["ninja","shonen","action"],
     "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1200&auto=format&fit=crop",
     "A mischievous ninja-in-training with a powerful secret."),
  mk(3,"Demon Slayer Vol. 1","Koyoharu Gotouge",10.99,["demon","historical","action"],
     "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1200&auto=format&fit=crop",
     "Tanjiro seeks a cure for his sister."),
  mk(4,"Attack on Titan Vol. 1","Hajime Isayama",10.99,["dark","apocalyptic","action"],
     "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop",
     "Humanity fights the Titans."),
  mk(5,"Jujutsu Kaisen Vol. 1","Gege Akutami",10.99,["supernatural","action"],
     "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
     "Curses, sorcerers, and a cursed finger."),
  mk(6,"Chainsaw Man Vol. 1","Tatsuki Fujimoto",10.99,["dark","action","comedy"],
     "https://images.unsplash.com/photo-1495441070467-98905e72f1bf?q=80&w=1200&auto=format&fit=crop",
     "Denji fuses with his chainsaw devil."),
  mk(7,"My Hero Academia Vol. 1","Kohei Horikoshi",9.99,["heroes","school","shonen"],
     "https://images.unsplash.com/photo-1473862170183-2f0f7e7bf1f3?q=80&w=1200&auto=format&fit=crop",
     "A power-less boy aims to be #1 hero."),
  mk(8,"SPY×FAMILY Vol. 1","Tatsuya Endo",10.99,["comedy","spy","family"],
     "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop",
     "A spy, an assassin, and a telepath family."),
];

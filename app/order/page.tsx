import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import OrderApp from "@/components/order/OrderApp";
import OrderUnavailable from "@/components/order/OrderUnavailable";
import { getOrderMenu } from "@/lib/order-menu";
import { getOrderingAccess } from "@/lib/ordering-status";
import { cloverSdkUrl } from "@/lib/clover";
import { getPickupInfo } from "@/lib/hours";
import { getDeliveryAccess } from "@/lib/delivery-status";
import { DELIVERY } from "@/lib/delivery-config";

export const metadata: Metadata = {
    title: "Order Online for Pickup | Elfatatry",
    description: "Order Elfatatry online for pickup in Streetsville, Mississauga.",
};

// Always fresh: depends on opening hours, the pause switch and the signed-in admin
export const dynamic = "force-dynamic";

export default async function OrderPage() {
    const access = await getOrderingAccess();

    if (!access.publicLive && !access.admin) return <OrderUnavailable paused={access.paused} />;
    if (access.missing.length) return <OrderUnavailable missing={access.admin ? access.missing : []} />;

    const deliveryAccess = await getDeliveryAccess();
    let menu;
    try {
        menu = (await getOrderMenu()).menu;
    } catch {
        return <OrderUnavailable />;
    }

    return (
        <>
            <SiteHeader />
            <main className="bg-background pt-16 md:pt-20">
                <OrderApp
                    menu={menu}
                    pickup={getPickupInfo()}
                    clover={{
                        publicKey: process.env.CLOVER_ECOMM_PUBLIC_KEY || "",
                        merchantId: process.env.CLOVER_MERCHANT_ID || "",
                        sdkUrl: cloverSdkUrl(),
                    }}
                    previewMode={access.admin && !access.publicLive}
                    delivery={{ available: deliveryAccess.available, minOrderCents: DELIVERY.minOrderCents, taxFee: DELIVERY.taxDeliveryFee }}
                />
            </main>
            <SiteFooter />
        </>
    );
}
